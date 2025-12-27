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
import { calculateDateDifference } from "~/utils";
import IconArrowLeft from "~icons/tabler/arrow-left";
import IconArrowRight from "~icons/tabler/arrow-right";
import IconPointFilled from "~icons/tabler/point-filled";
import IconPig from "~icons/tabler/pig";
import IconShare from "~icons/tabler/share";
import Relates from "~/features/article/blocks/Relates";
import Comment from "~/features/article/comments/Comment";
import Copyright from "~/features/article/blocks/Copyright";
import DateCat from "~/features/post-listing/PostMeta";
import ArticleLayout from "~/layouts/ArticleLayout";
import SocialButton from "~/features/article/sidebar/social/Button";
import Like from "~/features/article/sidebar/social/Like";
import Translate from "~/features/article/sidebar/social/Translate";
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
    const hasWords = () => typeof blog.words === "number" && blog.words > 0;
    const hasTags = () => tags().length > 0;
    const renderExpiredText = () => {
        if (!LL) return null;
        const dateText = calculateDateDifference(
            new Date(blog.updated ?? blog.date),
            lang() as string,
        );
        console.log("|", dateText, "|")
        const fullText = LL().post.EXPIRED_NOTIFY({ date: dateText });
        if (!dateText || !fullText.includes(dateText)) return fullText;
        const [prefix, suffix] = fullText.split(dateText);
        return (
            <>
                {prefix}
                <span class="font-semibold underline underline-offset-4">
                    {dateText}
                </span>
                {suffix}
            </>
        );
    };
    return (
        <>
            <div class="pt-10 md:pt-14 mb-8 ">
                <div class="space-y-4">
                    <DateCat date={blog.date} category={blog.category} />
                    <div class="space-y-3">
                        <h1 class="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-[var(--c-text)]">
                            {blog.title}
                        </h1>
                        <Show when={!!blog.subtitle}>
                            <h2 class="text-xl md:text-2xl text-[var(--c-text-muted)] leading-relaxed">
                                {blog.subtitle}
                            </h2>
                        </Show>
                    </div>
                </div>
                <Show when={hasWords() || hasTags()}>
                    <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--c-text-subtle)] font-mono uppercase tracking-wide">
                        <Show when={hasWords()}>
                            <span class="tabular-nums">
                                {blog.words} {LL && LL().post.W}
                            </span>
                        </Show>
                        <Show when={hasWords() && hasTags()}>
                            <IconPointFilled
                                width={6}
                                height={6}
                                class="text-[var(--c-text-subtle)] opacity-70"
                            />
                        </Show>
                        <Show when={hasTags()}>
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
                        </Show>
                    </div>
                </Show>
                <Show when={!!blog.lang}>
                    <div class="pt-2">
                        <Translate pageURL={blog.slug} lang={blog.lang} />
                    </div>
                </Show>
            </div>
            <Show when={blog.category && !isRecently}>
                <div class="my-8 rounded border border-dashed border-[var(--c-border)] px-5 py-4 text-base font-mono text-[var(--c-text-muted)]">
                    <p class="leading-relaxed">
                        {renderExpiredText()}
                    </p>
                </div>
            </Show>
        </>
    );
};

export const Neighbours = ({
    neighbours,
    LL,
}: {
    neighbours?: ArticleNeighbours;
    LL: Accessor<Translations>;
}) => {
    const { prev, next } = neighbours ?? {};
    return (
        <div class="mt-10 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {next && (
                <a
                    href={next.slug}
                    class="group inline-flex flex-col items-start gap-1 text-[var(--c-text)]"
                >
                    <span class="inline-flex items-center gap-2 text-sm text-[var(--c-text-subtle)] transition-colors group-hover:text-[var(--c-link)]">
                        <IconArrowLeft class="shrink-0 transition-transform group-hover:-translate-x-1" />
                        {LL && LL().post.NEWER}
                    </span>
                    <span class="text-base md:text-lg font-medium">
                        {next.title}
                    </span>
                </a>
            )}
            {prev && (
                <a
                    href={prev.slug}
                    class="group inline-flex flex-col items-start gap-1 text-[var(--c-text)] md:ml-auto md:items-end md:text-right"
                >
                    <span class="inline-flex items-center gap-2 text-sm text-[var(--c-text-subtle)] transition-colors group-hover:text-[var(--c-link)]">
                        {LL && LL().post.OLDER}
                        <IconArrowRight class="shrink-0 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span class="text-base md:text-lg font-medium">
                        {prev.title}
                    </span>
                </a>
            )}
        </div>
    );
};

const PostActions = ({ pageURL }: { pageURL: string }) => {
    return (
        <div class="mt-10 flex flex-wrap items-center gap-4">
            <Like pageURL={pageURL} />
            <SocialButton
                IconName={IconPig}
                text="Reward"
                kind="reward"
                hoverColor="hover:text-amber-500 focus:text-amber-500"
            />
            <SocialButton
                IconName={IconShare}
                text="Share"
                kind="share"
                hoverColor="hover:text-sky-500 focus:text-sky-500"
            />
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

    return (
        <ArticleLayout headParams={headParams}>
            <PostMeta blog={blog} lang={locale} LL={LL} />
            {wrapper}
            <PostActions pageURL={blog.slug} />
            <PostExtra
                rawBlog={blog}
                relates={relates}
                hideComment={hideComment}
                LL={LL}
            />
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
                    updated={new Date(rawBlog.updated ?? rawBlog.date)}
                />
                <Relates relates={relates} LL={LL} />
                <Neighbours neighbours={rawBlog.neighbours} LL={LL} />
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
