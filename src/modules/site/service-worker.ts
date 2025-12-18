import { clientsClaim, skipWaiting } from "workbox-core";
import { registerRoute } from 'workbox-routing';

skipWaiting()
clientsClaim()

const ASSETS_PREFIXES = [
    `https://unpkg.com/wir@`,
    `https://npm.onmicrosoft.cn/wir@`,
    `https://jsd.nmmsl.top/npm/wir@`,
    `https://cdn.jsdmirror.com/npm/wir@`,
    ``
]

const looksLikeSemver = (value: string) =>
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(String(value ?? ""));

const fetchAsset = (url: string, signal: AbortSignal) => {
    return new Promise((resolve, reject) => {
        fetch(url, { signal })
            .then(async res => res.ok ? resolve(res) : reject())
            .catch(() => reject())
    })
}

const getSwHash = () => {
    try {
        return new URL(self.location.href).searchParams.get("v") ?? "";
    } catch {
        return "";
    }
};

const getAssetVersion = () => {
    try {
        const sp = new URL(self.location.href).searchParams;
        return sp.get("av") ?? sp.get("v") ?? "";
    } catch {
        return "";
    }
};

const fetchAssets = async (pathname: string, version: string) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const prefixes =
        version && looksLikeSemver(version) ? ASSETS_PREFIXES : [``];

    try {
        const res = await Promise.any(
            prefixes.map((prefix) =>
                fetchAsset(!prefix ? pathname : `${prefix}${version}${pathname.slice(7)}`, signal),
            ),
        );
        const body = await (res as Response).text();
        controller.abort();
        return { headers: (res as Response).headers, body, status: (res as Response).status };
    } catch {
        controller.abort();
        return null;
    }
};

registerRoute(({ request }) => request.url.includes("_build/assets") && (request.destination === 'script' || request.destination === 'style'),
    async ({ event, request }) => {
        const parsedUrl = new URL(request.url);
        const version = getAssetVersion();
        const fetched = await fetchAssets(parsedUrl.pathname, version);
        if (!fetched) return fetch(request);
        const { body, ...rest } = fetched;
        return new Response(body, rest);
    }
);

const dataCacheName = () => `data-${getSwHash() || "dev"}`;

registerRoute(
    ({ request, url }) =>
        request.method === "GET" &&
        url.origin === self.location.origin &&
        url.pathname.startsWith("/_data/"),
    async ({ request }) => {
        const cache = await caches.open(dataCacheName());
        try {
            const res = await fetch(request, { cache: "no-store" });
            if (res.ok) void cache.put(request, res.clone());
            return res;
        } catch {
            const cached = await cache.match(request);
            if (cached) return cached;
            return new Response("offline", { status: 504 });
        }
    },
);

self.addEventListener("activate", (event) => {
    const keep = dataCacheName();
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter((k) => k.startsWith("data-") && k !== keep)
                    .map((k) => caches.delete(k)),
            );
        })(),
    );
});
