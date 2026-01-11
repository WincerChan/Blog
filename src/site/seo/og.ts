import type { HeadParams } from "./types";

export const DEFAULT_OG_IMAGE = "/favicon/generated/logo-512.png";

const sanitizeOgSlug = (slug: string) =>
    String(slug ?? "")
        .replace(/\0/g, "")
        .replace(/[\\/]/g, "_")
        .trim();

const getBaseURL = () =>
    typeof __SITE_CONF !== "undefined" && __SITE_CONF.baseURL
        ? __SITE_CONF.baseURL
        : "https://example.com";

const safeUrl = (value: string) => {
    try {
        return new URL(value, getBaseURL());
    } catch {
        return new URL(getBaseURL());
    }
};

const decodePathname = (value: string) => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const resolvePageOgSlug = (pathname: string) => {
    if (pathname === "/") return "page/index";
    const trimmed = pathname.replace(/^\/+|\/+$/g, "");
    return trimmed ? `page/${trimmed}` : "page/index";
};

export const resolveOgImagePath = (pageURL: string, cover?: string) => {
    const url = safeUrl(pageURL || "/");
    const pathname = decodePathname(url.pathname);
    const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
    const match = normalized.match(/^\/posts\/(.+?)\/$/);
    if (match) {
        const slug = sanitizeOgSlug(match[1]);
        return slug ? `/og/${slug}.png` : DEFAULT_OG_IMAGE;
    }
    const pageSlug = sanitizeOgSlug(resolvePageOgSlug(normalized));
    return pageSlug ? `/og/${pageSlug}.png` : DEFAULT_OG_IMAGE;
};

export const resolveOgImageUrl = (params: Pick<HeadParams, "pageURL" | "cover">) =>
    new URL(resolveOgImagePath(params.pageURL, params.cover), getBaseURL()).toString();
