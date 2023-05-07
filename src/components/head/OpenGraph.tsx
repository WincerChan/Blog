import { default as siteConf } from "@/hugo.json";
import { Meta } from "solid-start";
import { HeadParamsTyoe } from "~/schema/Head";

const OpenGraph = ({ params }: { params: HeadParamsTyoe }) => {
    const title = params.title ? `${params.title} · ${siteConf.title}` : siteConf.title
    return (
        <>
            <Meta property="og:title" content={title} />
            <Meta property="og:type" content="article" />
            <Meta property="og:site_name" content={siteConf.title} />
            <Meta property="og:locale" content="zh_CN" />
            <Meta property="og:description" content={params.description || siteConf.description} />
            <Meta property="og:url" content={`${new URL(params.pageURL, siteConf.baseURL)}`} />
            <Meta property="og:image" content="https://ae01.alicdn.com/kf/H3581d2df939f4c3182b1d4b9c2a47bdaO.png" />
            <Meta property="article:published_time" content={params.date.toISOString()} />
            <Meta property="article:modified_time" content={params.updated.toISOString()} />
            <Meta property="article:author" content={siteConf.author.name} />
        </>
    );
};

export default OpenGraph;
