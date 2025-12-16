import { useParams } from "@solidjs/router";
import { Show, createMemo } from "solid-js";
import PostLayout from "~/components/layouts/PostLayout";
import { getPostBySlug, getPostNeighbours, postUrl } from "~/content/velite";
import { findRelatedPosts, maybeEncryptHtml } from "~/content/post-utils";
import NotFound from "~/routes/[...404]";

export default function PostRoute() {
    const params = useParams();
    const post = createMemo(() => getPostBySlug(params.slug));

    return (
        <Show when={post()} fallback={<NotFound />}>
            {(p) => {
                const html = p().html ?? "";
                const content = p().encrypt_pwd ? maybeEncryptHtml(p(), html) : html;
                const neighbours = getPostNeighbours(p().slug);
                const relates = findRelatedPosts(p());

                const rawBlog: any = {
                    slug: postUrl(p().slug),
                    title: p().title,
                    subtitle: p().subtitle,
                    date: p().date,
                    updated: p().updated ?? p().date,
                    cover: p().cover ?? "",
                    tags: p().tags ?? [],
                    category: p().category ?? "",
                    summary: p().summary,
                    words: p().words ?? 0,
                    toc: p().toc ?? "",
                    neighbours,
                };
                if (p().encrypt_pwd) rawBlog.password = p().encrypt_pwd;
                if (p().mathrender) rawBlog.mathrender = true;
                if (p().lang) rawBlog.lang = p().lang;
                if (p().isTranslation !== undefined)
                    rawBlog.isTranslation = p().isTranslation;

                return (
                    <PostLayout rawBlog={rawBlog} relates={relates}>
                        {p().encrypt_pwd ? content : <section innerHTML={content} />}
                    </PostLayout>
                );
            }}
        </Show>
    );
}

