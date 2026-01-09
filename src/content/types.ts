export type VelitePost = {
    title: string;
    subtitle?: string;
    date: string;
    updated?: string;
    category?: string;
    tags?: string[];
    slug: string;
    cover?: string;
    draft?: boolean;
    private?: boolean;
    isTranslation?: boolean;
    lang?: string;
    encrypted?: boolean;
    mathrender?: boolean;
    html?: string;
    toc?: string;
    summary?: string;
    words?: number;
};

export type VelitePage = {
    title: string;
    date: string;
    updated?: string;
    slug: string;
    weight?: number;
    cover?: string;
    draft?: boolean;
    private?: boolean;
    isTranslation?: boolean;
    lang?: string;
    html?: string;
    toc?: string;
    summary?: string;
};

export type FriendLink = {
    name: string;
    url: string;
    avatar?: string;
    inactive?: boolean;
};
