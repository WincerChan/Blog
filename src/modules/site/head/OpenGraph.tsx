import { Meta } from "@solidjs/meta";
import type { HeadParams } from "./types";

const OpenGraph = ({ params }: { params: HeadParams }) => {
    const title = params.title ? `${params.title} · ${__SITE_CONF.title}` : __SITE_CONF.title
    return (
        <>
            <Meta property="og:title" content={title} />
            <Meta property="og:type" content="article" />
            <Meta property="og:site_name" content={__SITE_CONF.title} />
            <Meta property="og:locale" content="zh_CN" />
            <Meta property="og:description" content={params.description || __SITE_CONF.description} />
            <Meta property="og:url" content={`${new URL(params.pageURL, __SITE_CONF.baseURL)}`} />
            <Meta property="og:image" content="https://ae01.alicdn.com/kf/H3581d2df939f4c3182b1d4b9c2a47bdaO.png" />
            <Meta property="article:published_time" content={params.date} />
            <Meta property="article:modified_time" content={params.updated || params.date} />
            <Meta property="article:author" content={__SITE_CONF.author.name} />
        </>
    );
};

export default OpenGraph;
