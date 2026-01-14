export const normalizeKudosPath = (pageURL: string) => {
    let slug = String(pageURL ?? "");
    if (!slug) return "";
    if (slug.endsWith("-zh/")) slug = slug.replace("-zh/", "/");
    if (slug.endsWith("-en/")) slug = slug.replace("-en/", "/");
    if (!slug.startsWith("/")) slug = `/${slug}`;
    if (!slug.endsWith("/")) slug = `${slug}/`;
    return slug;
};
