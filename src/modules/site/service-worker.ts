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

const fetchAsset = (url: string, signal: AbortSignal) => {
    return new Promise((resolve, reject) => {
        fetch(url, { signal })
            .then(async res => res.ok ? resolve(res) : reject())
            .catch(() => reject())
    })
}

const getAssetVersion = () => {
    try {
        return new URL(self.location.href).searchParams.get("v") ?? "";
    } catch {
        return "";
    }
};

const fetchAssets = async (pathname: string, version: string) => {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
        const res = await Promise.any(
            ASSETS_PREFIXES.map((prefix) =>
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
