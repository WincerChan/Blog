import type { FriendLink, VelitePage, VelitePost } from "./types";

type PostNeighbourLink = { title: string; slug: string };
type PostNeighbours = { prev?: PostNeighbourLink; next?: PostNeighbourLink };
type RelatedPost = { title: string; slug: string; date: string; score: number };

export type VelitePostPublic = VelitePost & {
    url?: string;
    neighbours?: PostNeighbours;
    relates?: RelatedPost[];
    hasMath?: boolean;
};

type CategoryIndexItem = { title: string; count: number; url?: string };

const postUrl = (slug: string) => `/posts/${slug}/`;
const pageUrl = (slug: string) => `/${slug}/`;

const safePathSegment = (value: string) =>
    String(value ?? "")
        .replace(/\0/g, "")
        .replace(/[\\/]/g, "_")
        .trim();

const safeEncode = (value: string) => encodeURIComponent(safePathSegment(value));

const readPublicJson = async <T>(urlPath: string, fallback: T): Promise<T> => {
    const normalized = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;

    if (import.meta.env.SSR) {
        const [{ readFile }, path] = await Promise.all([
            import("node:fs/promises"),
            import("node:path"),
        ]);
        try {
            let decoded = normalized;
            try {
                decoded = decodeURIComponent(normalized);
            } catch {
                // keep encoded path
            }
            const filepath = path.join(
                process.cwd(),
                "public",
                decoded.replace(/^\//, ""),
            );
            return JSON.parse(await readFile(filepath, "utf8")) as T;
        } catch {
            return fallback;
        }
    }

    try {
        const res = await fetch(normalized);
        if (!res.ok) return fallback;
        return (await res.json()) as T;
    } catch {
        return fallback;
    }
};

const getLatestPosts = async (limit = 5) => {
    const data = await readPublicJson<VelitePostPublic[]>(
        "/_data/posts/latest.json",
        [],
    );
    return data.slice(0, limit);
};

const getPostBySlug = async (slug: string) => {
    if (!slug) return undefined;
    return await readPublicJson<VelitePostPublic | undefined>(
        `/_data/posts/${safeEncode(slug)}.json`,
        undefined,
    );
};

const getPostNeighbours = async (slug: string) => (await getPostBySlug(slug))?.neighbours;

const getPageBySlug = async (slug: string) => {
    if (!slug) return undefined;
    return await readPublicJson<VelitePage | undefined>(
        `/_data/pages/${safeEncode(slug)}.json`,
        undefined,
    );
};

const getPostsByCategory = async (category: string) => {
    if (!category) return [] as VelitePostPublic[];
    return await readPublicJson<VelitePostPublic[]>(
        `/_data/category/${safeEncode(category)}.json`,
        [],
    );
};

const getCategoryIndex = async () =>
    await readPublicJson<CategoryIndexItem[]>("/_data/category/index.json", []);

const getFriendLinks = async () =>
    await readPublicJson<FriendLink[]>("/_data/friends.json", []);

export {
    getCategoryIndex,
    getFriendLinks,
    getLatestPosts,
    getPageBySlug,
    getPostBySlug,
    getPostNeighbours,
    getPostsByCategory,
    pageUrl,
    postUrl,
};
