import { clientsClaim, skipWaiting } from "workbox-core";
import { registerRoute } from 'workbox-routing';

skipWaiting()
clientsClaim()

const ASSETS_PREFIXES = [
    `https://unpkg.com/wir@`,
    `https://npm.onmicrosoft.cn/wir@`,
    `https://jsd.nmmsl.top/npm/wir@`,
    ``
]

const fetchAsset = (url: string, signal: AbortSignal) => {
    return new Promise((resolve, reject) => {
        fetch(url, { signal })
            .then(async res => res.ok ? resolve(res) : reject())
            .catch(() => reject())
    })
}

const catchAssets = async (pathname: string, version: string) => {
    const controller = new AbortController(),
        signal = controller.signal;
    return Promise.any(ASSETS_PREFIXES.map(prefix => fetchAsset(!prefix ? pathname : `${prefix}${version}${pathname}`, signal)))
        .then(async res => {
            const body = await res.text();
            controller.abort();
            return { headers: res.headers, body: body, status: res.status }
        })
        .catch(err => console.log(err))

}

registerRoute(({ request }) => request.url.includes("_build/assets") && (request.destination === 'script' || request.destination === 'style'),
    async ({ event }) => {
        const version = event.target.location.search.slice(3)
        const parsedUrl = new URL(event.request.url);
        const { body, ...rest } = await catchAssets(parsedUrl.pathname, version)
        return new Response(body, rest)
    }
);