import { For } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import SimplePageLayout from "~/layouts/SimplePageLayout";
import { formatDate } from "~/utils";

const Archives = ({ page }) => {
    const { LL } = useI18nContext();
    const postsByYear = __CONTENT_POSTS_BY_YEAR_DETAIL;
    const allYears = Object.keys(postsByYear)
        .filter((x) => x !== "undefined")
        .sort((a, b) => Number(b) - Number(a));

    const yearCount = (year: string) => (postsByYear?.[year]?.length ?? 0) as number;
    const totalCount = () =>
        allYears.reduce((sum, year) => sum + yearCount(year), 0);
    const formatMonthDay = (value: string) => {
        const formatted = formatDate(value);
        const [year, month, day] = formatted.split("-");
        if (!month || !day) return formatted;
        return `${month}-${day}`;
    };

    return (
        <SimplePageLayout page={page} lang={page.lang}>
            <p class="mt-2 mb-8 text-xl font-serif md:text-2xl text-[var(--c-text-muted)] leading-relaxed">
                {LL && LL().archive.ARCHIVES_SUBTITLE({ total: totalCount() })}
            </p>
            <div class="">
                <For each={allYears}>
                    {(year) => (
                        <section
                            id={`year-${year}`}
                            class="archives-year mt-10 first:mt-0"
                        >
                            <div class="sticky top-16 z-10 flex items-center justify-between gap-4 border-b border-[var(--c-border)] bg-[var(--c-bg)] py-3">
                                {/* Sticky offset matches header height (h-16). */}
                                <h2 class="text-3xl font-semibold text-[var(--c-text)] font-mono">
                                    {year}
                                </h2>
                                <div class="flex items-center gap-3 text-[var(--c-text-subtle)]">
                                    <span class="text-base font-medium tabular-nums text-[var(--c-text)]">
                                        {yearCount(year)} {LL && LL().archive.POSTS_UNIT()}
                                    </span>
                                </div>
                            </div>
                            <div class="mt-4">
                                <ol class="space-y-4">
                                    <For each={postsByYear[year] ?? []}>
                                        {(post) => (
                                            <li>
                                                <a
                                                    href={post.slug}
                                                    class="flex items-center gap-x-8 text-[var(--c-text)]"
                                                >
                                                    <span class="text-sm pl-1 font-mono tabular-nums text-[var(--c-text-subtle)]">
                                                        {formatMonthDay(post.date)}
                                                    </span>
                                                    <span class="min-w-0 text-base md:text-lg font-medium transition-colors hover:text-[var(--c-link)]">
                                                        {post.title}
                                                    </span>
                                                </a>
                                            </li>
                                        )}
                                    </For>
                                </ol>
                            </div>
                        </section>
                    )}
                </For>
            </div>
        </SimplePageLayout >
    )
}

export default Archives;
