import { useParams } from "@solidjs/router";
import { Show, createEffect, createResource, createSignal } from "solid-js";
import ArticlePage from "~/layouts/ArticlePage";
import { VELITE_NOT_FOUND, getPostBySlug, postUrl } from "~/content/velite";
import type { VelitePostPublic } from "~/content/velite";
import type { RelatedPost } from "~/features/article/types";
import NotFound from "~/routes/[...all]";

type PostPayload = VelitePostPublic | typeof VELITE_NOT_FOUND | null | undefined;

export default function PostRoute() {
    const params = useParams();
    const slug = () => String(params.slug || "");
    const [post] = createResource(slug, getPostBySlug);
    const resolved = () => post() as PostPayload;
    const [stale, setStale] = createSignal<PostPayload>();

    createEffect(() => {
        const v = resolved();
        if (!v || v === VELITE_NOT_FOUND) return;
        setStale(v);
    });

    const displayed = () => resolved() ?? stale();

    return (
        <Show keyed when={displayed()} fallback={<section class="" />}>
            {(p) => {
                if (p === VELITE_NOT_FOUND) return <NotFound />;

                const html = p.html ?? "";
                const isEncrypted = p.encrypted === true;
                const content = html;
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
                if (isEncrypted) rawBlog.encrypted = true;
                if (p.hasLegacyComments !== undefined) {
                    rawBlog.hasLegacyComments = p.hasLegacyComments;
                }
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
