import { useHead } from "@solidjs/web";
import type { HeadParams } from "./types";

const normalizePath = (pathname: string) => (pathname.endsWith("/") ? pathname : `${pathname}/`);

const buildHreflangLinks = (params: HeadParams) => {
    if (params.isTranslation === undefined || !params.pageURL) return null;
    const normalized = normalizePath(params.pageURL);
    const basePath = normalized.replace(/\/$/, "");
    const baseSlug = basePath.endsWith("-en") ? basePath.slice(0, -3) : basePath;
    const zhPath = `${baseSlug}/`;
    const enPath = `${baseSlug}-en/`;
    return { zh: zhPath, en: enPath };
};

const MainMeta = ({ params }: { params: HeadParams }) => {
    const title = params.title ? `${params.title} · ${__SITE_CONF.title}` : `首页 · ${__SITE_CONF.title}`
    const hreflang = buildHreflangLinks(params);
    useHead(() => [
        { tag: "meta", props: { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" } },
        { tag: "title", props: { children: title } },
        { tag: "meta", props: { name: "description", content: params.description || __SITE_CONF.description } },
        ...(params.keywords ? [{ tag: "meta" as const, props: { name: "keywords", content: params.keywords.join(", ") } }] : []),
        { tag: "meta", props: { name: "referrer", content: "same-origin" } },
        { tag: "meta", props: { name: "date", content: params.date } },
        { tag: "meta", props: { name: "author", content: __SITE_CONF.author.name } },
        { tag: "meta", props: { name: "theme-color", content: "#fff" } },
        { tag: "link", props: { rel: "canonical", href: new URL(normalizePath(params.pageURL), __SITE_CONF.baseURL).toString() } },
        ...(hreflang ? [
            { tag: "link" as const, props: { rel: "alternate", href: new URL(hreflang.zh, __SITE_CONF.baseURL).toString(), hreflang: "zh-CN" } },
            { tag: "link" as const, props: { rel: "alternate", href: new URL(hreflang.en, __SITE_CONF.baseURL).toString(), hreflang: "en" } },
        ] : []),
        { tag: "link", props: { rel: "manifest", href: "/manifest.webmanifest" } },
    ]);
    return null;
};

export default MainMeta;
