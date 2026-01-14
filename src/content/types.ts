export type VelitePost = {
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
};

export type VelitePage = {
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
