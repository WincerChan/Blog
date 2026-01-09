export type ArticleNeighbourLink = {
    title: string;
    slug: string;
};

export type ArticleNeighbours = {
    prev?: ArticleNeighbourLink;
    next?: ArticleNeighbourLink;
};

export type RelatedPost = {
    title: string;
    slug: string;
    date: string;
    score: number;
};

export type ArticleMeta = {
    slug: string;
    title: string;
    subtitle?: string;
    date: string;
    updated: string;
    cover?: string;
    tags: string[];
    summary?: string;
    category?: string;
    words?: number;
    toc?: string;
    hasMath?: boolean;
    encrypted?: boolean;
    isTranslation?: boolean;
    lang?: string;
    neighbours?: ArticleNeighbours;
};
