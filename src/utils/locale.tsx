export type Locale = "en" | "zh-CN";

export const detectLocaleFromPath = (pathname: string): Locale => {
    const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
    return path.endsWith("-en/") || __CONTENT_EN_POSTS.includes(path) ? "en" : "zh-CN";
};
