export type HeadParams = {
    title: string;
    date: string;
    description: string;
    keywords: string[];
    pageURL: string;
    updated: string;
    cover: string;
    words: number;
    subtitle: string;
    genre: string;
    hasMath: boolean;
    lang?: string;
    isTranslation?: boolean;
    toc?: string;
};

export type HeadParamsInput = Partial<HeadParams>;

export const resolveHeadParams = (input: HeadParamsInput): HeadParams => {
    const date = input.date ?? new Date().toDateString();
    return {
        title: input.title ?? "",
        date,
        description: input.description ?? __SITE_CONF.description,
        keywords: input.keywords ?? __SITE_CONF.keywords.split(", "),
        pageURL: input.pageURL ?? __SITE_CONF.baseURL,
        updated: input.updated ?? date,
        cover: input.cover ?? "",
        words: input.words ?? 0,
        subtitle: input.subtitle ?? "",
        genre: input.genre ?? "Technology",
        hasMath: input.hasMath ?? false,
        lang: input.lang,
        isTranslation: input.isTranslation,
        toc: input.toc,
    };
};
