import { HeadParamsTyoe } from "~/schema/Head";
import ApplicationMeta from "./ApplicationMeta";
import MainMeta from "./MainMeta";
import OpenGraph from "./OpenGraph";

const blogLDJSON = () => {
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": __SITE_CONF.title,
        "url": __SITE_CONF.baseURL
    })
}

const postLDJSON = (params: HeadParamsTyoe) => {
    const base = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "name": params.title,
        "editor": __SITE_CONF.author.name,
        "author": {
            "@type": "Person",
            "name": __SITE_CONF.author.name,
            "url": __SITE_CONF.author.url
        },
        "datePublished": params.date,
        "dateModified": params.updated,
        "image": params.cover,
        "publisher": {
            "@type": "Organization",
            "name": __SITE_CONF.title,
            "logo": {
                "@type": "ImageObject",
                "url": "https://ae01.alicdn.com/kf/H3581d2df939f4c3182b1d4b9c2a47bdaO.png"
            }
        },
        "headline": params.title,
        "inLanguage": "zh-CN",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": new URL(params.pageURL, __SITE_CONF.baseURL)

        },
        "keywords": params.keywords && params.keywords.join(", "),
        "description": params.description.slice(0, 200),
        "genre": params.genre,
    }
    // @ts-ignore
    params.words && (base['wordCount'] = params.words)
    // @ts-ignore
    params.subtitle && (base['alternativeHeadline'] = params.subtitle)
    return JSON.stringify(base)
}


const HeadParamsDefault = {
    title: "",
    date: new Date().toDateString(),
    description: __SITE_CONF.description,
    keywords: __SITE_CONF.keywords.split(", "),
    pageURL: __SITE_CONF.baseURL,
    updated: new Date().toDateString(),
    cover: "",
    words: 0,
    subtitle: "",
    genre: "Technology",
}

const HeadTag = ({ headParams }: { headParams: HeadParamsTyoe }) => {
    headParams = {
        ...HeadParamsDefault,
        ...headParams
    }
    const isPost = headParams.description !== __SITE_CONF.description
    return (
        <>
            <MainMeta params={headParams} />
            <ApplicationMeta />
            <OpenGraph params={headParams} />
            <script type="application/ld+json" innerHTML={isPost ? postLDJSON(headParams) : blogLDJSON()} />
        </>
    )
}

export default HeadTag;

