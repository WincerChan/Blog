import type { VelitePost } from "~/content/types";

export type PostListItem = Pick<
    VelitePost,
    "title" | "subtitle" | "date" | "category" | "cover" | "summary" | "words"
> & {
    slug: string;
};

