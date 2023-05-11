import { clientsClaim, skipWaiting } from 'workbox-core';
import { registerRoute } from 'workbox-routing';

skipWaiting();
clientsClaim();

// const ASSETS_PREFIEXES = [
//     "https://unpkg.com/",
//     "https://npm.elemecdn.com/",
// ]

const ASSETS_PREFIEXES = [
    "http://localhost:8080",
    ""
]

const fetchAssets = async (pathname: string) => {
    const controller = new AbortController(),
        signal = controller.signal;
    return Promise.any(ASSETS_PREFIEXES.map(prefix => fetch(`${prefix}${pathname}`, { signal })))
        .then(async res => {
            const text = await res.text();
            controller.abort();
            return {
                headers: res.headers,
                body: text,
                status: res.status,
            };
        })
        .catch(err => Promise.reject(err))
}

// 添加自定义的路由和策略
registerRoute(({ request }) => request.destination === "script" && request.url.includes(":8080") && request.url.includes("index"),
    async ({ event }) => {
        console.log('Custom fetch handler:', event.request);
        const parsedUrl = new URL(event.request.url);
        const { body, ...rest } = await fetchAssets(parsedUrl.pathname)
        return new Response(body, rest)
    }
);
