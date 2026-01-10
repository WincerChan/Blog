import type { ArticleMeta } from "~/features/article/types";

export const hasTranslationMeta = (blog: ArticleMeta) =>
    !!blog.lang && blog.isTranslation !== undefined;
