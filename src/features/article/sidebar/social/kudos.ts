export const normalizeKudosPath = (pageURL: string) => {
    let slug = String(pageURL ?? "");
    if (!slug) return "";
    if (slug.endsWith("-zh/")) slug = slug.replace("-zh/", "/");
    if (slug.endsWith("-en/")) slug = slug.replace("-en/", "/");
    return slug;
};
