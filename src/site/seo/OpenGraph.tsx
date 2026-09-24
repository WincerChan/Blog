import { useHead } from "@solidjs/web";
import type { HeadParams } from "./types";
import { resolveOgImageUrl } from "./og";

const OpenGraph = ({ params }: { params: HeadParams }) => {
    const title = params.title ? `${params.title} · ${__SITE_CONF.title}` : __SITE_CONF.title
    const ogImage = resolveOgImageUrl(params);
    useHead(() => [
        { tag: "meta", props: { property: "og:title", content: title } },
        { tag: "meta", props: { property: "og:type", content: "article" } },
        { tag: "meta", props: { property: "og:site_name", content: __SITE_CONF.title } },
        { tag: "meta", props: { property: "og:locale", content: "zh_CN" } },
        { tag: "meta", props: { property: "og:description", content: params.description || __SITE_CONF.description } },
        { tag: "meta", props: { property: "og:url", content: new URL(params.pageURL, __SITE_CONF.baseURL).toString() } },
        { tag: "meta", props: { property: "og:image", content: ogImage } },
        { tag: "meta", props: { name: "twitter:card", content: "summary_large_image" } },
        { tag: "meta", props: { name: "twitter:image", content: ogImage } },
        { tag: "meta", props: { property: "article:published_time", content: params.date } },
        { tag: "meta", props: { property: "article:modified_time", content: params.updated || params.date } },
        { tag: "meta", props: { property: "article:author", content: __SITE_CONF.author.name } },
    ]);
    return null;
};

export default OpenGraph;
