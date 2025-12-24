import { inkstoneApi } from "~/utils/inkstone";

const isBrowser = typeof window !== "undefined";

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
let engagedSent = false;
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

const trackEngage = (useBeacon = false) => {
    if (!currentId || engagedSent) return;
    const duration = Math.max(0, Date.now() - startedAt);
    engagedSent = true;
    sendPulse("pulse/engage", { page_instance_id: currentId, duration_ms: duration }, useBeacon);
};

const ensureHooks = () => {
    if (!isBrowser || hooksReady) return;
    hooksReady = true;
    window.addEventListener("pagehide", () => trackEngage(true));
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") trackEngage(true);
    });
};

const trackPage = (pathname?: string) => {
    if (!isBrowser) return;
    ensureHooks();
    const nextPath = normalizePath((pathname ?? window.location.pathname) || "/");
    if (currentPath === nextPath && currentId) return;
    trackEngage();
    currentId = createPageInstanceId();
    currentPath = nextPath;
    startedAt = Date.now();
    engagedSent = false;
    sendPulse("pulse/pv", { page_instance_id: currentId, path: nextPath });
};

export { trackEngage, trackPage };
