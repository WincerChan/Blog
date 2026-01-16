import { Show, createMemo } from "solid-js";
import { useHead } from "@solidjs/meta";
import MainMeta from "./MainMeta";
import OpenGraph from "./OpenGraph";
import { HeadParams, HeadParamsInput, resolveHeadParams } from "./types";
import { resolveOgImageUrl } from "./og";

import katexCssHref from "katex/dist/katex.min.css?url";

const blogLDJSON = () => {
    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": __SITE_CONF.title,
        "url": __SITE_CONF.baseURL
    })
}

const postLDJSON = (params: HeadParams) => {
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
        "image": resolveOgImageUrl(params),
        "publisher": {
            "@type": "Organization",
            "name": __SITE_CONF.title,
            "logo": {
                "@type": "ImageObject",
                "url": new URL("/favicon/generated/logo-512.png", __SITE_CONF.baseURL).toString()
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

const HeadTag = (props: { headParams: HeadParamsInput }) => {
    const resolved = createMemo(() => resolveHeadParams(props.headParams));
    return (
        <Show keyed when={resolved()}>
            {(params) => {
                const inkstonePath = (() => {
                    try {
                        return new URL(params.pageURL, __SITE_CONF.baseURL).pathname;
                    } catch {
                        return String(params.pageURL ?? "");
                    }
                })();
                const jsonLd = () =>
                    params.description !== __SITE_CONF.description
                        ? postLDJSON(params)
                        : blogLDJSON();

                useHead({
                    tag: "script",
                    id: "json-ld",
                    props: {
                        type: "application/ld+json",
                        get children() {
                            return jsonLd();
                        },
                    },
                    setting: { close: true, escape: false },
                });
                useHead({
                    tag: "meta",
                    id: "inkstone-token",
                    props: {
                        name: "inkstone:token",
                        content: params.inkstoneToken ?? "",
                    },
                });
                useHead({
                    tag: "meta",
                    id: "inkstone-path",
                    props: {
                        name: "inkstone:path",
                        content: inkstonePath,
                    },
                });

                return (
                    <>
                    <MainMeta params={params} />
                    {params.hasMath && (
                        <link rel="stylesheet" href={katexCssHref} />
                    )}
                    <OpenGraph params={params} />
                    </>
                );
            }}
        </Show>
    );
};

export default HeadTag;
