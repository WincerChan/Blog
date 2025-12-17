import postsRaw from "../../.velite/posts.json";
import pagesRaw from "../../.velite/pages.json";
import friendsRaw from "../../.velite/friends.json";

import type { FriendLink, VelitePage, VelitePost } from "./types";

const allPosts = postsRaw as unknown as VelitePost[];
const allPages = pagesRaw as unknown as VelitePage[];
const allFriends = friendsRaw as unknown as FriendLink[];

const visiblePosts = () =>
    allPosts.filter((p) => p.draft !== true).filter((p) => p.private !== true);

const canonicalPosts = () => visiblePosts().filter((p) => p.isTranslation !== true);

const visiblePages = () =>
    allPages
        .filter((p) => p.draft !== true)
        .filter((p) => p.private !== true)
        .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

const publishedPosts = () => canonicalPosts();
const publishedPages = () => visiblePages();

const byDateDesc = <T extends { date: string }>(items: T[]) =>
    [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const postUrl = (slug: string) => `/posts/${slug}/`;
const pageUrl = (slug: string) => `/${slug}/`;

const getPostBySlug = (slug: string) =>
    visiblePosts().find((p) => String(p.slug) === String(slug));

const getPostNeighbours = (slug: string) => {
    const current = getPostBySlug(slug);
    const list = byDateDesc(
        current?.isTranslation ? visiblePosts().filter((p) => p.isTranslation === true) : publishedPosts(),
    );
    const idx = list.findIndex((p) => String(p.slug) === String(slug));
    const prev = idx >= 0 ? list[idx + 1] : undefined;
    const next = idx >= 0 ? list[idx - 1] : undefined;
    const toLink = (p?: VelitePost) =>
        p
            ? {
                title: p.title,
                slug: postUrl(p.slug),
            }
            : undefined;
    return {
        prev: toLink(prev),
        next: toLink(next),
    };
};

const getPageBySlug = (slug: string) =>
    visiblePages().find((p) => String(p.slug) === String(slug));

const getPostsByCategory = (category: string) =>
    publishedPosts().filter((p) => String(p.category ?? "") === String(category));

const getLatestPosts = (limit = 5) => byDateDesc(publishedPosts()).slice(0, limit);

const getCategoryIndex = () => {
    const counts = new Map<string, number>();
    for (const p of publishedPosts()) {
        const c = p.category;
        if (!c) continue;
        counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([title, count]) => ({ title, count }));
};

const getFriendLinks = () => allFriends;

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
    publishedPages,
    publishedPosts,
};
