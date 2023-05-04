import siteConf from "@/hugo.json";
import { HeadParamsTyoe } from "~/schema/Head";
import ApplicationMeta from "./ApplicationMeta";
import MainMeta from "./MainMeta";
import OpenGraph from "./OpenGraph";

const blogLDJSON = () => {
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": siteConf.title,
        "url": siteConf.baseURL
    })
}

const postLDJSON = (params: HeadParamsTyoe) => {
    const base = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "name": params.title,
        "editor": siteConf.author.name,
        "author": {
            "@type": "Person",
            "name": siteConf.author.name
        },
        "datePublished": params.date.toISOString(),
        "dateModified": params.updated.toISOString(),
        "image": params.cover,
        "publisher": {
            "@type": "Organization",
            "name": siteConf.title,
            "logo": {
                "@type": "ImageObject",
                "url": "https://ae01.alicdn.com/kf/H3581d2df939f4c3182b1d4b9c2a47bdaO.png"
            }
        },
        "headline": params.title,
        "inLanguage": "zh-CN",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": new URL(params.pageURL, siteConf.baseURL)

        },
        "keywords": params.keywords.join(", "),
        "description": params.description.slice(0, 200),
        "genre": params.genre,
    }
    // @ts-ignore
    params.words && (base['wordCount'] = params.words)
    // @ts-ignore
    params.subtitle && (base['alternativeHeadline'] = params.subtitle)
    return JSON.stringify(base)
}


const HeadTag = ({ headParams }: { headParams: HeadParamsTyoe }) => {
    const isPost = headParams.description !== siteConf.description
    return (
        <>
            <MainMeta params={headParams} />
            <ApplicationMeta />
            <OpenGraph params={headParams} />
            <script type="application/ld+json" innerHTML={isPost ? postLDJSON(headParams) : blogLDJSON()} />
            <script innerHTML={`!function(){let e=localStorage.getItem('customer-theme')||''; if(e===''){e = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';};document.documentElement.setAttribute("class", e)}()`} />
        </>
    )
}

export default HeadTag;

