import type { FriendLink, VelitePage, VelitePost } from "./types";
import { pageUrl, postUrl, safeEncode } from "./velite-utils";
import { readPublicJsonSync } from "./velite.server";

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

const VELITE_NOT_FOUND = { __veliteNotFound: true } as const;
type VeliteNotFound = typeof VELITE_NOT_FOUND;

const readPublicJsonClient = async <T>(urlPath: string, fallback: T): Promise<T> => {
    const normalized = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
    try {
        const res = await fetch(normalized);
        if (!res.ok) return fallback;
        return (await res.json()) as T;
    } catch {
        return fallback;
    }
};

const readPublicJson = (import.meta.env.SSR
    ? readPublicJsonSync
    : readPublicJsonClient) as <T>(urlPath: string, fallback: T) => T | Promise<T>;

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (value as any).then === "function";

const getLatestPosts = (limit = 5) => {
    const data = readPublicJson<VelitePostPublic[]>("/_data/posts/latest.json", []);
    if (isPromiseLike(data))
        return data.then((d) =>
            Array.isArray(d) ? d.slice(0, limit) : ([] as VelitePostPublic[]),
        ) as Promise<VelitePostPublic[]>;
    return Array.isArray(data) ? data.slice(0, limit) : [];
};

const getPostBySlug = (slug: string) => {
    if (!slug) return VELITE_NOT_FOUND;
    return readPublicJson<VelitePostPublic | VeliteNotFound>(
        `/_data/posts/${safeEncode(slug)}.json`,
        VELITE_NOT_FOUND,
    );
};

const getPostNeighbours = async (slug: string) => (await getPostBySlug(slug))?.neighbours;

const getPageBySlug = (slug: string) => {
    if (!slug) return VELITE_NOT_FOUND;
    return readPublicJson<VelitePage | VeliteNotFound>(
        `/_data/pages/${safeEncode(slug)}.json`,
        VELITE_NOT_FOUND,
    );
};

const getPostsByCategory = (category: string) => {
    if (!category) return [] as VelitePostPublic[];
    const data = readPublicJson<VelitePostPublic[]>(
        `/_data/category/${safeEncode(category)}.json`,
        [],
    );
    if (isPromiseLike(data))
        return data.then((d) => (Array.isArray(d) ? d : [])) as Promise<VelitePostPublic[]>;
    return Array.isArray(data) ? data : [];
};

const getCategoryIndex = async () =>
    await readPublicJson<CategoryIndexItem[]>("/_data/category/index.json", []);

const getFriendLinks = async () =>
    await readPublicJson<FriendLink[]>("/_data/friends.json", []);

export {
    VELITE_NOT_FOUND,
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
