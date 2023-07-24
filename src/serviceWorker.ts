import { clientsClaim, skipWaiting } from 'workbox-core';
import { registerRoute } from 'workbox-routing';

skipWaiting();
clientsClaim();

const ASSETS_PREFIEXES = [
    `https://unpkg.com/wir@${import.meta.env.VITE_ASSET_VERSION}`,
    `https://npm.onmicrosoft.cn/wir@${import.meta.env.VITE_ASSET_VERSION}`,
    ``
]



const fetchAssets = async (pathname: string) => {
    const controller = new AbortController(),
        signal = controller.signal;
    return Promise.any(ASSETS_PREFIEXES.map(prefix => fetch(`${prefix}${pathname}`, { signal })))
        .then(async res => {
            if (res.status !== 200) Promise.reject(res.status);
            const text = await res.text();
            controller.abort();
            return {
                headers: res.headers,
                body: text,
                status: res.status,
            }
        })
        .catch(err => Promise.reject(err))
}

// 添加自定义的路由和策略
registerRoute(({ request }) => request.url.includes("/assets/") && (request.destination === 'script' || request.destination === 'style'),
    async ({ event }) => {
        const parsedUrl = new URL(event.request.url);
        const { body, ...rest } = await fetchAssets(parsedUrl.pathname)
        return new Response(body, rest)
    }
);
