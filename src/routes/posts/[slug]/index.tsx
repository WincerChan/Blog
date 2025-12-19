import { createAsync, useParams } from "@solidjs/router";
import { Show, createEffect, createSignal } from "solid-js";
import ArticlePage from "~/layouts/ArticlePage";
import { VELITE_NOT_FOUND, getPostBySlug, postUrl } from "~/content/velite";
import { maybeEncryptHtml } from "~/content/post-utils";
import type { RelatedPost } from "~/modules/article/types";
import NotFound from "~/routes/[...all]";

export default function PostRoute() {
    const params = useParams();
    const slug = () => String(params.slug || "");
    const post = createAsync(() => getPostBySlug(slug())) as any;
    const resolved = () => (import.meta.env.SSR ? post() : post.latest) as any;
    const [stale, setStale] = createSignal<any>();

    createEffect(() => {
        const v = resolved();
        if (!v || v === VELITE_NOT_FOUND) return;
        setStale(v);
    });

    const displayed = () => resolved() ?? stale();

    return (
        <Show keyed when={displayed()} fallback={<section class="md-content" />}>
            {(p) => {
                if (p === VELITE_NOT_FOUND) return <NotFound />;

                const html = p.html ?? "";
                const content = p.encrypt_pwd ? maybeEncryptHtml(p, html) : html;
                const neighbours = p.neighbours;
                const relates = (p.relates ?? []) as RelatedPost[];
                const hasMath =
                    !!p.hasMath || !!p.mathrender || String(p.html ?? "").includes("katex");

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
                if (p.isTranslation !== undefined) rawBlog.isTranslation = p.isTranslation;

                return (
                    <ArticlePage rawBlog={rawBlog} relates={relates}>
                        {p.encrypt_pwd ? content : <section class="md-content" innerHTML={content} />}
                    </ArticlePage>
                );
            }}
        </Show>
    );
}
