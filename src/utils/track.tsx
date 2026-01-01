import { inkstoneApi } from "~/utils/inkstone";

const isBrowser = typeof window !== "undefined";
const siteName = (() => {
    try {
        return new URL(__SITE_CONF.baseURL).host;
    } catch {
        return "";
    }
})();

const normalizePath = (pathname: string) =>
    pathname.endsWith("/") ? pathname : `${pathname}/`;

const createPageInstanceId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `pv_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
};

let currentId: string | null = null;
let currentPath: string | null = null;
let startedAt = 0;
let accumulatedMs = 0;
let hooksReady = false;

const sendPulse = (endpoint: string, payload: Record<string, unknown>, useBeacon = false) => {
    if (!isBrowser) return;
    const url = inkstoneApi(endpoint);
    const body = JSON.stringify(payload);
    if (useBeacon && "sendBeacon" in navigator) {
        const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
        const ok = navigator.sendBeacon(url, blob);
        if (ok) return;
    }
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body,
        credentials: "include",
        keepalive: true,
    }).catch(() => undefined);
};

const startTiming = () => {
    if (!currentId || startedAt) return;
    startedAt = Date.now();
};

const pauseAndSend = (useBeacon = false) => {
    if (!currentId || !startedAt) return;
    const now = Date.now();
    accumulatedMs += Math.max(0, now - startedAt);
    startedAt = 0;
    sendPulse(
        "pulse/engage",
        { page_instance_id: currentId, duration_ms: accumulatedMs, site: siteName },
        useBeacon,
    );
};

const trackEngage = (useBeacon = false) => {
    pauseAndSend(useBeacon);
};

const ensureHooks = () => {
    if (!isBrowser || hooksReady) return;
    hooksReady = true;
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            pauseAndSend(true);
        } else if (document.visibilityState === "visible") {
            startTiming();
        }
    });
};

const trackPage = (pathname?: string) => {
    if (!isBrowser) return;
    ensureHooks();
    const nextPath = normalizePath((pathname ?? window.location.pathname) || "/");
    if (currentPath === nextPath && currentId) return;
    pauseAndSend();
    currentId = createPageInstanceId();
    currentPath = nextPath;
    accumulatedMs = 0;
    startedAt = document.visibilityState === "visible" ? Date.now() : 0;
    const referrer = document.referrer;
    sendPulse("pulse/pv", {
        page_instance_id: currentId,
        path: nextPath,
        site: siteName,
        ...(referrer ? { referrer } : {}),
    });
};

export { trackEngage, trackPage };
