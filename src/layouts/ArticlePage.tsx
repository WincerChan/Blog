import { useLocation } from "@solidjs/router";
import {
    Accessor,
    For,
    JSXElement,
    Show,
    createMemo,
    lazy,
    onMount,
} from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import { Locales, Translations } from "~/i18n/i18n-types";
import { calculateDateDifference, formatDate } from "~/utils";
import IconArrowLeft from "~icons/tabler/arrow-left";
import IconArrowRight from "~icons/tabler/arrow-right";
import IconPointFilled from "~icons/tabler/point-filled";
import Relates from "~/features/article/blocks/Relates";
import Comment from "~/features/article/comments/Comment";
import Copyright from "~/features/article/blocks/Copyright";
import LazyBg from "~/ui/media/BG";
import ArticleLayout from "~/layouts/ArticleLayout";
import type { ArticleMeta, ArticleNeighbours, RelatedPost } from "~/features/article/types";

const ProtectBlog = lazy(() => import("~/features/article/blocks/EncryptBlock"));

const PostMeta = ({
    blog,
    lang,
    LL,
}: {
    blog: ArticleMeta;
    lang: Accessor<Locales>;
    LL: Accessor<Translations>;
}) => {
    const updatedDate = new Date(blog.updated ?? blog.date);
    const isRecently =
        new Date().getTime() - updatedDate.getTime() < 90 * 24 * 60 * 60 * 1000;
    const tags = () => (blog.tags ?? []).filter(Boolean);
    return (
        <>
            <LazyBg
                class="pt-10 md:pt-14 pb-8 border-b border-[var(--c-border)] space-y-3"
            >
                <h1 class="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-[var(--c-text)]">
                    {blog.title}
                </h1>
                <Show when={!!blog.subtitle}>
                    <h2 class="text-lg md:text-xl text-[var(--c-text-muted)] leading-relaxed">
                        {blog.subtitle}
                    </h2>
                </Show>
                <Show when={blog.category}>
                    <div
                        id="post-meta"
                        class="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--c-text-subtle)] font-mono uppercase tracking-wide"
                    >
                        <span class="tabular-nums">{formatDate(blog.date)}</span>
                        <Show when={blog.words}>
                            <IconPointFilled
                                width={6}
                                height={6}
                                class="text-[var(--c-text-subtle)] opacity-70"
                            />
                            <span class="tabular-nums">
                                {blog.words} {LL && LL().post.W}
                            </span>
                        </Show>
                        <Show when={tags().length}>
                            <IconPointFilled
                                width={6}
                                height={6}
                                class="text-[var(--c-text-subtle)] opacity-70"
                            />
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <For each={tags()}>
                                    {(tag) => (
                                        <a
                                            href={`/search/?q=tags:${tag}`}
                                            class="group inline-flex items-center gap-1 text-[var(--c-text-subtle)] transition-colors hover:text-[var(--c-link)]"
                                        >
                                            <span class="text-[var(--c-text-subtle)] transition-colors group-hover:text-[var(--c-link)]">#</span>
                                            {tag}
                                        </a>
                                    )}
                                </For>
                            </div>
                        </Show>
                    </div>
                </Show>
            </LazyBg>
            <Show when={blog.category && !isRecently}>
                <div class="mt-6 rounded-md border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2 text-sm text-[var(--c-text-muted)]">
                    <p class="leading-relaxed">
                        {LL &&
                            LL().post.EXPIRED_NOTIFY({
                                date: calculateDateDifference(
                                    new Date(blog.updated ?? blog.date),
                                    lang() as string,
                                ),
                            })}
                    </p>
                </div>
            </Show>
        </>
    );
};

export const Neighbours = ({ neighbours }: { neighbours?: ArticleNeighbours }) => {
    const { prev, next } = neighbours ?? {};
    return (
        <div class="">
            {next && (
                <a
                    href={next.slug}
                    class=""
                >
                    <IconArrowLeft />
                    {next.title}
                </a>
            )}
            {prev && (
                <a
                    href={prev.slug}
                    class=""
                >
                    {prev.title}
                    <IconArrowRight />
                </a>
            )}
        </div>
    );
};

const constructHeadParams = (blog: ArticleMeta) => {
    return {
        title: blog.title,
        description: blog.summary || blog.title,
        date: blog.date,
        keywords: blog.tags,
        pageURL: blog.slug,
        words: blog.words,
        subtitle: blog.subtitle || "",
        cover: blog.cover ?? "",
        updated: blog.updated ?? blog.date,
        mathrender: !!blog.mathrender,
        lang: blog.lang,
        isTranslation: blog.isTranslation,
        toc: blog.toc,
        genre: "Technology",
    };
};

type PostProps = {
    children: JSXElement;
    rawBlog: ArticleMeta;
    relates: RelatedPost[];
    hideComment?: boolean;
};

const ArticlePage = ({ children, rawBlog, relates, hideComment }: PostProps) => {
    const hash = createMemo(() => useLocation().hash);
    onMount(() => {
        if (!hash()) return;
        const id = decodeURIComponent(hash());
        document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
    });
    const { LL, locale } = useI18nContext();

    const blog = rawBlog;
    const headParams = constructHeadParams(blog);

    let wrapper: JSXElement;
    if (blog.encrypted) wrapper = <ProtectBlog source={children} />;
    else wrapper = <div id="blog-article">{children}</div>;

    let extra = (
        <PostExtra
            rawBlog={blog}
            relates={relates}
            hideComment={hideComment}
            LL={LL}
        />
    );
    return (
        <ArticleLayout headParams={headParams} extra={extra}>
            <PostMeta blog={blog} lang={locale} LL={LL} />
            {wrapper}
        </ArticleLayout>
    );
};

interface PostExtraProps {
    rawBlog: ArticleMeta;
    relates: RelatedPost[];
    hideComment?: boolean;
    LL: Accessor<Translations>;
}

export const PostExtra = ({
    rawBlog,
    relates,
    hideComment,
    LL,
}: PostExtraProps) => {
    return (
        <>
            <Show when={rawBlog.category}>
                <Copyright
                    title={rawBlog.title}
                    slug={rawBlog.slug}
                    updated={new Date(rawBlog.updated ?? rawBlog.date)}
                    LL={LL}
                />
                <Relates relates={relates} LL={LL} />
                <Neighbours neighbours={rawBlog.neighbours} />
            </Show>
            <Show when={!hideComment}>
                <Comment
                    pageURL={rawBlog.slug}
                    LL={LL}
                    hasLegacyComments={rawBlog.hasLegacyComments}
                />
            </Show>
        </>
    );
};

export default ArticlePage;
