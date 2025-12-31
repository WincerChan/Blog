import { skipWaiting } from "workbox-core";
import { registerRoute } from 'workbox-routing';

const shouldSkipWaiting = (data: unknown): data is { type: string } => {
    if (typeof data !== "object" || data === null) return false;
    return (data as { type?: string }).type === "SKIP_WAITING";
};

self.addEventListener("message", (event) => {
    if (!shouldSkipWaiting(event.data)) return;
    skipWaiting();
});

const ASSETS_PREFIXES = [
    `https://unpkg.com/wir@`,
    `https://npm.onmicrosoft.cn/wir@`,
    `https://cdn.jsdmirror.com/npm/wir@`,
]

const getSwHash = () => {
    try {
        return new URL(self.location.href).searchParams.get("v") ?? "";
    } catch {
        return "";
    }
};

const fetchFirstOk = async (urls: string[]) => {
    const controllers = urls.map(() => new AbortController());
    const tasks = urls.map((url, index) =>
        fetch(url, { signal: controllers[index]!.signal }).then((res) => {
            if (!res.ok) throw new Error(`bad status: ${res.status}`);
            return { res, index };
        }),
    );

    try {
        const { res, index } = (await Promise.any(tasks)) as {
            res: Response;
            index: number;
        };
        controllers.forEach((c, i) => i !== index && c.abort());
        return res;
    } catch {
        controllers.forEach((c) => c.abort());
        return null;
    }
};

const fetchNpmAsset = (pathname: string) => {
    const npmPath = pathname.startsWith("/_build/")
        ? pathname.slice("/_build".length)
        : pathname;
    const urls = [
        ...ASSETS_PREFIXES.map((p) => `${p}latest${npmPath}`),
        pathname,
    ];
    return fetchFirstOk(urls);
};

registerRoute(
    ({ request, url }) =>
        request.method === "GET" &&
        url.origin === self.location.origin &&
        url.pathname.startsWith("/_build/assets/") &&
        (request.destination === "script" || request.destination === "style"),
    async ({ request, url }) => {
        const cache = await caches.open(`assets-${getSwHash() || "dev"}`);
        const cached = await cache.match(request);
        if (cached) return cached;

        const res = await fetchNpmAsset(url.pathname);
        if (res) {
            void cache.put(request, res.clone());
            return res;
        }

        return fetch(request);
    },
);

const dataCacheName = () => `data-${getSwHash() || "dev"}`;

registerRoute(
    ({ request, url }) =>
        request.method === "GET" &&
        url.origin === self.location.origin &&
        url.pathname.startsWith("/_data/"),
    async ({ request, url }) => {
        const cache = await caches.open(dataCacheName());
        try {
            const res = await fetch(request, { cache: "no-store" });
            if (res.ok) {
                void cache.put(request, res.clone());
                return res;
            }

            const mirror = await fetchFirstOk(
                ASSETS_PREFIXES.map((p) => `${p}latest${url.pathname}`),
            );
            if (mirror) {
                void cache.put(request, mirror.clone());
                return mirror;
            }
            return res;
        } catch {
            const mirror = await fetchFirstOk(
                ASSETS_PREFIXES.map((p) => `${p}latest${url.pathname}`),
            );
            if (mirror) {
                void cache.put(request, mirror.clone());
                return mirror;
            }
            const cached = await cache.match(request);
            if (cached) return cached;
            return new Response("offline", { status: 504 });
        }
    },
);

self.addEventListener("activate", (event) => {
    const keepData = dataCacheName();
    const keepAssets = `assets-${getSwHash() || "dev"}`;
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter(
                        (k) =>
                            (k.startsWith("data-") && k !== keepData) ||
                            (k.startsWith("assets-") && k !== keepAssets),
                    )
                    .map((k) => caches.delete(k)),
            );
        })(),
    );
});
