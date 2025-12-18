import { createAsync, useParams } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import ArticlePageLayout from "~/modules/article/layout/ArticlePageLayout";
import { getPostBySlug, postUrl } from "~/content/velite";
import { maybeEncryptHtml } from "~/content/post-utils";
import type { RelatedPost } from "~/modules/article/types";
import NotFound from "~/routes/[...404]";

export default function PostRoute() {
    const params = useParams();
    const post = createAsync(() => getPostBySlug(params.slug));

    return (
        <Suspense fallback={<section class="md-content" />}>
            <Show keyed when={post()} fallback={<NotFound />}>
                {(p) => {
                    const html = p.html ?? "";
                    const content = p.encrypt_pwd
                        ? maybeEncryptHtml(p, html)
                        : html;
                    const neighbours = p.neighbours;
                    const relates = (p.relates ?? []) as RelatedPost[];
                    const hasMath =
                        !!p.hasMath ||
                        !!p.mathrender ||
                        String(p.html ?? "").includes("katex");

                    const rawBlog: any = {
                        slug: p.url ?? postUrl(p.slug),
                        title: p.title,
                        subtitle: p.subtitle,
                        date: p.date,
                        updated: p.updated ?? p.date,
                        cover: p.cover ?? "",
                        tags: p.tags ?? [],
                        category: p.category ?? "",
                        summary: p.summary,
                        words: p.words ?? 0,
                        toc: p.toc ?? "",
                        neighbours,
                        mathrender: hasMath,
                    };
                    if (p.encrypt_pwd) rawBlog.password = p.encrypt_pwd;
                    if (p.lang) rawBlog.lang = p.lang;
                    if (p.isTranslation !== undefined)
                        rawBlog.isTranslation = p.isTranslation;

                    return (
                        <ArticlePageLayout rawBlog={rawBlog} relates={relates}>
                            {p.encrypt_pwd ? (
                                content
                            ) : (
                                <section
                                    class="md-content"
                                    innerHTML={content}
                                />
                            )}
                        </ArticlePageLayout>
                    );
                }}
            </Show>
        </Suspense>
    );
}
