const INKSTONE_BASE = import.meta.env.DEV
    ? "http://localhost:8080"
    : "https://inkstone.itswincer.com";

const joinBase = (path: string) => {
    const safePath = String(path ?? "").trim();
    if (!safePath) return INKSTONE_BASE;
    return new URL(safePath, INKSTONE_BASE).toString();
};

const inkstoneApi = (path: string) => {
    const safePath = String(path ?? "").trim();
    if (!safePath) return joinBase("/v2");
    const stripped = safePath.replace(/^\/+/, "");
    const apiPath = stripped.startsWith("v2/") ? `/${stripped}` : `/v2/${stripped}`;
    return joinBase(apiPath);
};

export { INKSTONE_BASE, inkstoneApi };
