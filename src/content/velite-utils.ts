const postUrl = (slug: string) => `/posts/${slug}/`;
const pageUrl = (slug: string) => `/${slug}/`;

const safePathSegment = (value: string) =>
    String(value ?? "")
        .replace(/\0/g, "")
        .replace(/[\\/]/g, "_")
        .trim();

const safeEncode = (value: string) => encodeURIComponent(safePathSegment(value));

export { pageUrl, postUrl, safeEncode, safePathSegment };

