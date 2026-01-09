import { Accessor, Show } from "solid-js";
import type { Translations } from "~/i18n/i18n-types";
import type { ArticleMeta, RelatedPost } from "~/features/article/types";
import Copyright from "~/features/article/blocks/Copyright";
import Relates from "~/features/article/blocks/Relates";
import Neighbours from "~/features/article/blocks/Neighbours";
import Comment from "~/features/article/comments/Comment";

const PostExtra = ({
    rawBlog,
    relates,
    hideComment,
    LL,
}: {
    rawBlog: ArticleMeta;
    relates: RelatedPost[];
    hideComment?: boolean;
    LL: Accessor<Translations>;
}) => {
    return (
        <>
            <Show when={rawBlog.category}>
                <Copyright
                    updated={new Date(rawBlog.updated ?? rawBlog.date)}
                />
                <Relates relates={relates} LL={LL} />
                <Neighbours neighbours={rawBlog.neighbours} LL={LL} />
            </Show>
            <Show when={!hideComment}>
                <Comment
                    pageURL={rawBlog.slug}
                    LL={LL}
                />
            </Show>
        </>
    );
};

export default PostExtra;
