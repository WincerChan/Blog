import { Link, Meta, Title } from "@solidjs/meta";
import { Show } from 'solid-js';
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
    return (
        <>
            <Meta charset="utf-8" />
            <Meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
            <Title>{title}</Title>
            <Meta name="description" content={params.description || __SITE_CONF.description} />
            {params.keywords && <Meta name="keywords" content={params.keywords.join(", ")} />}
            <Meta name="referrer" content="same-origin" />
            <Meta name="date" content={params.date} />
            <Meta name="author" content={__SITE_CONF.author.name} />
            <Meta name="theme-color" content="#fff" />
            <Link rel="canonical" href={new URL(normalizePath(params.pageURL), __SITE_CONF.baseURL).toString()} />
            {hreflang && (
                <>
                    <Link rel="alternate" href={new URL(hreflang.zh, __SITE_CONF.baseURL).toString()} hreflang="zh-CN" />
                    <Link rel="alternate" href={new URL(hreflang.en, __SITE_CONF.baseURL).toString()} hreflang="en" />
                </>
            )}
            <Link rel="manifest" href="/manifest.webmanifest" />
        </>
    );
};

export default MainMeta;
