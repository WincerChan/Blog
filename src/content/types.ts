export type Post = {
    title: string;
    subtitle?: string;
    date: string;
    updated: string;
    category?: string;
    tags?: string[];
    slug: string;
    cover?: string;
    draft?: boolean;
    isTranslation?: boolean;
    lang?: string;
    encrypted?: boolean;
    html?: string;
    toc?: string;
    summary?: string;
    words?: number;
    inkstoneToken?: string;
    discussionUrl?: string;
};

export type Page = {
    title: string;
    date: string;
    updated: string;
    slug: string;
    weight?: number;
    cover?: string;
    draft?: boolean;
    isTranslation?: boolean;
    lang?: string;
    html?: string;
    toc?: string;
    summary?: string;
    inkstoneToken?: string;
};

export type FriendLink = {
    name: string;
    url: string;
    avatar?: string;
    inactive?: boolean;
};

type PostNeighbourLink = { title: string; slug: string };
type PostNeighbours = { prev?: PostNeighbourLink; next?: PostNeighbourLink };
type RelatedPost = { title: string; slug: string; date: string; score: number };

export type PostPublic = Post & {
    url?: string;
    neighbours?: PostNeighbours;
    relates?: RelatedPost[];
    hasMath?: boolean;
    inkstoneToken?: string;
};
