type TrackerConfig = {
  baseUrl: string;
  siteHost?: string;
  isDev?: boolean;
  debug?: boolean;
  fetch?: typeof fetch;
  document?: Document;
  navigator?: Navigator;
  location?: Location;
  crypto?: Crypto;
};

type Tracker = {
  trackPage: (pathname?: string, token?: string) => void;
  trackEngage: (useBeacon?: boolean) => void;
  bindVisibility: () => void;
};

const normalizePath = (pathname: string) =>
  pathname.endsWith("/") ? pathname : `${pathname}/`;

const createPageInstanceId = (cryptoImpl?: Crypto) => {
  if (cryptoImpl && "randomUUID" in cryptoImpl && typeof cryptoImpl.randomUUID === "function") {
    return cryptoImpl.randomUUID();
  }
  return `pv_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
};

const createTracker = (config: TrackerConfig): Tracker => {
  const baseUrl = String(config.baseUrl ?? "").trim();
  const siteHost = String(config.siteHost ?? "").trim();
  const isDev = Boolean(config.isDev);
  const debug = Boolean(config.debug);
  const fetchImpl = config.fetch ?? (typeof fetch === "function" ? fetch : undefined);
  const doc = config.document ?? (typeof document === "undefined" ? undefined : document);
  const nav = config.navigator ?? (typeof navigator === "undefined" ? undefined : navigator);
  const loc = config.location ?? (typeof window === "undefined" ? undefined : window.location);
  const cryptoImpl = config.crypto ?? (typeof crypto === "undefined" ? undefined : crypto);

  const isBrowser = Boolean(doc && nav && loc);
  const logSkip = (endpoint: string, reason: string) => {
    if (!debug) return;
    console.log(`[pulse] skip ${endpoint}: ${reason}`);
  };

  const joinBase = (path: string) => {
    if (!baseUrl) return "";
    return new URL(path, baseUrl).toString();
  };

  const inkstoneApi = (path: string) => {
    const safePath = String(path ?? "").trim();
    if (!safePath) return joinBase("/v2");
    const stripped = safePath.replace(/^\/+/, "");
    const apiPath = stripped.startsWith("v2/") ? `/${stripped}` : `/v2/${stripped}`;
    return joinBase(apiPath);
  };

  const shouldSendPulse = () => {
    if (!isBrowser) return { ok: false, reason: "not in browser" };
    if (isDev) return { ok: true, reason: "" };
    if (!siteHost) return { ok: false, reason: "missing siteHost" };
    if (loc && loc.hostname !== siteHost) {
      return {
        ok: false,
        reason: `site mismatch (${siteHost} !== ${loc.hostname})`,
      };
    }
    return { ok: true, reason: "" };
  };

  const sendPulse = async (
    endpoint: string,
    payload: Record<string, unknown>,
    options: { useBeacon?: boolean; token: string },
  ) => {
    const check = shouldSendPulse();
    if (!check.ok) {
      logSkip(endpoint, check.reason);
      return;
    }
    if (!fetchImpl) {
      logSkip(endpoint, "missing fetch");
      return;
    }
    const tokenValue = options.token;
    if (!tokenValue) return;
    const apiBase = inkstoneApi(endpoint);
    if (!apiBase) {
      logSkip(endpoint, "missing baseUrl");
      return;
    }
    const url = new URL(apiBase);
    url.searchParams.set("inkstone_token", tokenValue);
    const body = JSON.stringify(payload);
    const useBeacon = Boolean(options.useBeacon);
    if (useBeacon && nav && "sendBeacon" in nav) {
      const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
      const ok = nav.sendBeacon(url.toString(), blob);
      if (ok) return;
    }
    try {
      await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body,
        credentials: "include",
        keepalive: true,
      });
    } catch {
      // ignore network errors
    }
  };

  let currentId: string | null = null;
  let currentPath: string | null = null;
  let currentToken: string | null = null;
  let startedAt = 0;
  let accumulatedMs = 0;
  let hooksReady = false;

  const startTiming = () => {
    if (!currentId || startedAt) return;
    startedAt = Date.now();
  };

  const pauseAndSend = (useBeacon = false) => {
    if (!currentId || !startedAt) return;
    const now = Date.now();
    accumulatedMs += Math.max(0, now - startedAt);
    startedAt = 0;
    const payload = { page_instance_id: currentId, duration_ms: accumulatedMs, site: siteHost };
    if (!currentPath || !currentToken) return;
    void sendPulse("pulse/engage", payload, { useBeacon, token: currentToken });
  };

  const bindVisibility = () => {
    if (!isBrowser || hooksReady || !doc) return;
    hooksReady = true;
    doc.addEventListener("visibilitychange", () => {
      if (doc.visibilityState === "hidden") {
        pauseAndSend(true);
      } else if (doc.visibilityState === "visible") {
        startTiming();
      }
    });
  };

  const trackEngage = (useBeacon = false) => {
    pauseAndSend(useBeacon);
  };

  const trackPage = (pathname?: string, token?: string) => {
    if (!isBrowser) return;
    if (!token) return;
    bindVisibility();
    const nextPath = normalizePath((pathname ?? loc?.pathname) || "/");
    if (currentPath === nextPath && currentId) return;
    pauseAndSend();
    currentId = createPageInstanceId(cryptoImpl);
    currentPath = nextPath;
    currentToken = token;
    accumulatedMs = 0;
    startedAt = doc?.visibilityState === "visible" ? Date.now() : 0;
    const referrer = doc?.referrer ?? "";
    void sendPulse(
      "pulse/pv",
      {
        page_instance_id: currentId,
        site: siteHost,
        ...(referrer ? { referrer } : {}),
      },
      { token },
    );
  };

  return { trackPage, trackEngage, bindVisibility };
};

export type { Tracker, TrackerConfig };
export { createTracker };
