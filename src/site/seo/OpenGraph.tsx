import { Meta } from "@solidjs/meta";
import type { HeadParams } from "./types";
import { resolveOgImageUrl } from "./og";

const OpenGraph = ({ params }: { params: HeadParams }) => {
    const title = params.title ? `${params.title} · ${__SITE_CONF.title}` : __SITE_CONF.title
    const ogImage = resolveOgImageUrl(params);
    return (
        <>
            <Meta property="og:title" content={title} />
            <Meta property="og:type" content="article" />
            <Meta property="og:site_name" content={__SITE_CONF.title} />
            <Meta property="og:locale" content="zh_CN" />
            <Meta property="og:description" content={params.description || __SITE_CONF.description} />
            <Meta property="og:url" content={`${new URL(params.pageURL, __SITE_CONF.baseURL)}`} />
            <Meta property="og:image" content={ogImage} />
            <Meta name="twitter:card" content="summary_large_image" />
            <Meta name="twitter:image" content={ogImage} />
            <Meta property="article:published_time" content={params.date} />
            <Meta property="article:modified_time" content={params.updated || params.date} />
            <Meta property="article:author" content={__SITE_CONF.author.name} />
        </>
    );
};

export default OpenGraph;
