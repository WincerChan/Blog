import { Accessor, For, Show } from "solid-js";
import IconPointFilled from "~icons/ph/dot-outline-fill";
import { calculateDateDifference } from "~/utils";
import { Locales, Translations } from "~/i18n/i18n-types";
import DateCat from "~/features/post-listing/PostMeta";
import Translate from "~/features/article/sidebar/social/Translate";
import type { ArticleMeta } from "~/features/article/types";

export const hasTranslationMeta = (blog: ArticleMeta) =>
    !!blog.lang && blog.isTranslation !== undefined;

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
    const hasTranslate = () => hasTranslationMeta(blog);
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

export default PostMeta;
