import type { Post } from "~/content/types";

export type PostListItem = Pick<
    Post,
    "title" | "subtitle" | "date" | "category" | "cover" | "summary" | "words"
> & {
    slug: string;
};

