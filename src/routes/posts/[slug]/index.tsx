import { useParams } from "@solidjs/router";
import { Show, createMemo } from "solid-js";
import ArticlePage, { ArticleNotFound } from "~/layouts/ArticlePage";
import { VELITE_NOT_FOUND, getPostBySlug, postUrl } from "~/content/velite";
import type { VelitePostPublic } from "~/content/velite";
import type { RelatedPost } from "~/features/article/types";

type PostPayload = VelitePostPublic | typeof VELITE_NOT_FOUND | null | undefined;

export default function PostRoute() {
    const params = useParams();
    const slug = () => String(params.slug || "");
    const post = createMemo(async () => getPostBySlug(slug()));
    const resolved = () => post() as PostPayload;
    const displayed = resolved;

    return (
        <Show keyed when={displayed()} fallback={<section class="" />}>
            {(p) => {
                if ("__veliteNotFound" in p) return <ArticleNotFound />;

                const html = p.html ?? "";
                const isEncrypted = p.encrypted === true;
                const content = html;
                const neighbours = p.neighbours;
                const relates = (p.relates ?? []) as RelatedPost[];
                const hasMath = !!p.hasMath || String(p.html ?? "").includes("katex");

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
                    hasMath,
                    inkstoneToken: p.inkstoneToken,
                    discussionUrl: p.discussionUrl,
                };
                if (isEncrypted) rawBlog.encrypted = true;
                if (p.lang) rawBlog.lang = p.lang;
                if (p.isTranslation !== undefined) rawBlog.isTranslation = p.isTranslation;

                return (
                    <ArticlePage rawBlog={rawBlog} relates={relates}>
                        {isEncrypted ? content : <section class="" innerHTML={content} />}
                    </ArticlePage>
                );
            }}
        </Show>
    );
}
