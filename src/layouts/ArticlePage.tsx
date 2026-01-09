import { useLocation } from "@solidjs/router";
import {
    Accessor,
    For,
    JSXElement,
    Show,
    createMemo,
    createSignal,
    lazy,
    onCleanup,
    onMount,
} from "solid-js";
import { render } from "solid-js/web";
import { useI18nContext } from "~/i18n/i18n-solid";
import { Locales, Translations } from "~/i18n/i18n-types";
import { calculateDateDifference } from "~/utils";
import IconArrowLeft from "~icons/ph/arrow-left";
import IconArrowRight from "~icons/ph/arrow-right";
import IconPointFilled from "~icons/ph/dot-outline-fill";
import IconBrandTwitter from "~icons/ph/twitter-logo";
import IconLink from "~icons/ph/link-simple";
import IconCheck from "~icons/ph/check";
import IconCopy from "~icons/ph/copy";
import Relates from "~/features/article/blocks/Relates";
import Comment from "~/features/article/comments/Comment";
import Copyright from "~/features/article/blocks/Copyright";
import DateCat from "~/features/post-listing/PostMeta";
import ArticleLayout from "~/layouts/ArticleLayout";
import Like from "~/features/article/sidebar/social/Like";
import Translate from "~/features/article/sidebar/social/Translate";
import type { ArticleMeta, ArticleNeighbours, RelatedPost } from "~/features/article/types";

const ProtectBlog = lazy(() => import("~/features/article/blocks/EncryptBlock"));
const normalizeLangLabel = (value: string | null) => {
    const trimmed = String(value ?? "").trim();
    return trimmed ? trimmed.toLowerCase() : "text";
};

const CodeBlockHeader = (props: { lang: string }) => (
    <>
        <span class="code-lang inline-flex items-center gap-2 font-mono text-sm">
            <span class="code-lang-text">{props.lang}</span>
        </span>
        <button
            type="button"
            class="code-copy inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-text)]"
            data-code-copy="true"
            data-copy-label="Copy"
            data-copied-label="Copied"
            title="Copy"
        >
            <IconCopy class="code-copy-icon h-4 w-4 shrink-0" />
            <span class="code-copy-text">Copy</span>
        </button>
    </>
);

const mountCodeBlockHeaders = (root: HTMLElement) => {
    const disposers: Array<() => void> = [];
    const codeBlocks = root.querySelectorAll<HTMLDivElement>(".code-block");
    codeBlocks.forEach((block) => {
        if (block.querySelector(":scope > .code-header")) return;
        const headerHost = document.createElement("div");
        headerHost.className =
            "code-header flex items-center justify-between border-b border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-2 text-sm uppercase tracking-[0.06em] text-[var(--c-text-subtle)]";
        block.prepend(headerHost);
        const langLabel = normalizeLangLabel(block.getAttribute("data-lang"));
        const dispose = render(() => <CodeBlockHeader lang={langLabel} />, headerHost);
        disposers.push(() => {
            dispose();
            if (headerHost.isConnected) headerHost.remove();
        });
    });
    return () => {
        disposers.forEach((dispose) => dispose());
    };
};

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
    const hasTranslate = () => !!blog.lang;
    const isArticle = () => blog.slug?.startsWith("/posts/");
    const showDateCat = () => isArticle();
    const showTranslateInDateLine = () =>
        hasTranslate() && showDateCat() && !hasWords() && !hasTags();
    const showTranslateInMetaLine = () =>
        hasTranslate() && showDateCat() && (hasWords() || hasTags());
    const showTranslateInTitleLine = () => hasTranslate() && !showDateCat();
    const renderExpiredText = () => {
        if (!LL) return null;
        const dateText = calculateDateDifference(
            new Date(blog.updated ?? blog.date),
            lang() as string,
        );
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
                    <Show when={showDateCat()}>
                        <Show
                            when={showTranslateInDateLine()}
                            fallback={<DateCat date={blog.date} category={blog.category} />}
                        >
                            <div class="flex flex-wrap items-center gap-3">
                                <DateCat date={blog.date} category={blog.category} />
                                <div class="ml-auto">
                                    <Translate pageURL={blog.slug} lang={blog.lang} />
                                </div>
                            </div>
                        </Show>
                    </Show>
                    <div class="">
                        <Show
                            when={showTranslateInTitleLine()}
                            fallback={(
                                <h1 class="text-3xl md:text-4xl font-semibold font-serif tracking-tight leading-tight text-[var(--c-text)]">
                                    {blog.title}
                                </h1>
                            )}
                        >
                            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                                <h1 class="text-3xl md:text-4xl font-medium font-serif tracking-tight leading-tight text-[var(--c-text)]">
                                    {blog.title}
                                </h1>
                                <div class="ml-auto">
                                    <Translate pageURL={blog.slug} lang={blog.lang} />
                                </div>
                            </div>
                        </Show>
                        <Show when={!!blog.subtitle}>
                            <h2 class="text-xl md:text-2xl mt-2 font-semibold text-[var(--c-text-muted)] leading-relaxed font-serif">
                                {blog.subtitle}
                            </h2>
                        </Show>
                    </div>
                </div>
                <Show when={hasWords() || hasTags()}>
                    <div class="mt-3 flex items-start gap-3 text-sm text-[var(--c-text-subtle)] font-mono uppercase tracking-wide">
                        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2">
                            <Show when={hasWords()}>
                                <span class="tabular-nums">
                                    {blog.words} {LL && LL().post.W}
                                </span>
                            </Show>
                            <Show when={hasWords() && hasTags()}>
                                <IconPointFilled
                                    width={12}
                                    height={12}
                                    class="text-[var(--c-text-subtle)] opacity-70"
                                />
                            </Show>
                            <Show when={hasTags()}>
                                <For each={tags()}>
                                    {(tag) => (
                                        <a
                                            href={`/search/?q=tags:${tag}`}
                                            class="group inline-flex items-center px-1 gap-1 text-[var(--c-text-subtle)] transition-colors hover:text-[var(--c-link)]"
                                        >
                                            <span class="text-[var(--c-text-subtle)] transition-colors group-hover:text-[var(--c-link)]">#</span>
                                            {tag}
                                        </a>
                                    )}
                                </For>
                            </Show>
                        </div>
                        <Show when={showTranslateInMetaLine()}>
                            <div class="ml-auto shrink-0">
                                <Translate pageURL={blog.slug} lang={blog.lang} />
                            </div>
                        </Show>
                    </div>
                </Show>
            </div>
            <Show when={blog.category && !isRecently}>
                <div class="my-6 mx-[-1rem] border border-dashed border-[var(--c-border)] px-5 py-4 text-base font-mono text-[var(--c-text-muted)] md:mx-0">
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
        <div class="mt-8 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                    class="group inline-flex flex-col items-start gap-1 text-[var(--c-text)] ml-auto items-end text-right md:ml-auto md:items-end md:text-right"
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
    const { LL } = useI18nContext();
    const buildShareUrl = () =>
        typeof window !== "undefined" ? window.location.href : pageURL;
    const twitterShareUrl = () =>
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(buildShareUrl())}`;
    const [copied, setCopied] = createSignal(false);
    let resetTimer: number | undefined;
    const copyUrl = async () => {
        if (typeof navigator === "undefined" || !navigator.clipboard) return;
        try {
            await navigator.clipboard.writeText(buildShareUrl());
            setCopied(true);
            if (resetTimer) window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore clipboard errors
        }
    };
    return (
        <div class="my-10 flex items-center justify-between border-y border-dashed border-[var(--c-border)] py-6">
            <Like pageURL={pageURL} />
            <div class="flex items-center gap-4">
                <span class="text-sm text-[var(--c-text-subtle)]">
                    {LL().sidebar.TOOLS.share.title()}
                </span>
                <a
                    href={twitterShareUrl()}
                    title="Share on Twitter"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center justify-center text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-link)]"
                >
                    <IconBrandTwitter width={26} height={26} class="block" />
                </a>
                <button
                    type="button"
                    title="Copy URL"
                    onClick={copyUrl}
                    class="inline-flex items-center justify-center text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-link)]"
                >
                    <Show
                        when={copied()}
                        fallback={<IconLink width={26} height={26} class="block transition-opacity duration-200 ease-out" />}
                    >
                        <IconCheck width={26} height={26} class="block text-green-600 transition-opacity duration-200 ease-out" />
                    </Show>
                </button>
            </div>
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
        hasMath: !!blog.hasMath,
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
    hideActions?: boolean;
};

const ArticlePage = ({
    children,
    rawBlog,
    relates,
    hideComment,
    hideActions,
}: PostProps) => {
    const hash = createMemo(() => useLocation().hash);
    onMount(() => {
        if (!hash()) return;
        const id = decodeURIComponent(hash()).replace(/^#/, "");
        if (!id) return;
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
    onMount(() => {
        const root = document.getElementById("blog-article");
        if (!root) return;
        const disposeHeaders = mountCodeBlockHeaders(root);
        onCleanup(() => disposeHeaders());
    });
    onMount(() => {
        const root = document.getElementById("blog-article");
        if (!root) return;
        const handleClick = async (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            const button = target.closest<HTMLButtonElement>("button[data-code-copy]");
            if (!button) return;
            const pre = button.closest(".code-block")?.querySelector("pre");
            const code = pre?.querySelector("code");
            const text = code?.textContent ?? "";
            if (!text.trim()) return;

            const label = button.getAttribute("data-copy-label") ?? "Copy";
            const copiedLabel = button.getAttribute("data-copied-label") ?? "Copied";
            const textNode = button.querySelector<HTMLElement>(".code-copy-text");
            const copiedClass = "text-[var(--c-text)]";
            const mutedClass = "text-[var(--c-text-muted)]";

            const writeText = async () => {
                if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text);
                    return true;
                }
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                const ok = document.execCommand("copy");
                textarea.remove();
                return ok;
            };

            try {
                const ok = await writeText();
                if (!ok) return;
                button.setAttribute("data-copied", "true");
                button.classList.add(copiedClass);
                button.classList.remove(mutedClass);
                if (textNode) textNode.textContent = copiedLabel;
                else button.textContent = copiedLabel;
                window.setTimeout(() => {
                    if (!button.isConnected) return;
                    button.removeAttribute("data-copied");
                    button.classList.remove(copiedClass);
                    button.classList.add(mutedClass);
                    if (textNode) textNode.textContent = label;
                    else button.textContent = label;
                }, 1600);
            } catch {
                // ignore copy errors
            }
        };
        root.addEventListener("click", handleClick);
        onCleanup(() => root.removeEventListener("click", handleClick));
    });
    const { LL, locale } = useI18nContext();

    const blog = rawBlog;
    const headParams = constructHeadParams(blog);

    let wrapper: JSXElement;
    if (blog.encrypted) wrapper = <ProtectBlog source={children} />;
    else
        wrapper = (
            <div id="blog-article" class="prose dark:prose-invert md:text-[1.05rem]  max-w-[42rem]">
                {children}
            </div>
        );

    return (
        <ArticleLayout headParams={headParams}>
            <PostMeta blog={blog} lang={locale} LL={LL} />
            {wrapper}
            <Show when={!hideActions}>
                <PostActions pageURL={blog.slug} />
            </Show>
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
                />
            </Show>
        </>
    );
};

export default ArticlePage;
