import { useLocation } from "@solidjs/router";
import { For, createEffect, onCleanup, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import OtherBlogs from "~/features/post-listing/OtherCards";
import SimplePageLayout from "~/layouts/SimplePageLayout";
import IconChevronRight from "~icons/tabler/chevron-right";

const Archives = ({ page }) => {
    const { LL } = useI18nContext();
    const location = useLocation();
    const postsByYear = __CONTENT_POSTS_BY_YEAR_DETAIL;
    const allYears = Object.keys(postsByYear)
        .filter((x) => x !== "undefined")
        .sort((a, b) => Number(b) - Number(a));

    const yearCount = (year: string) => (postsByYear?.[year]?.length ?? 0) as number;
    const totalCount = () =>
        allYears.reduce((sum, year) => sum + yearCount(year), 0);

    onMount(() => {
        const openDetails = (details: HTMLDetailsElement) => {
            document
                .querySelectorAll("details.archives-year")
                .forEach((node) => ((node as HTMLDetailsElement).open = false));
            details.open = true;
        };

        const openFromHash = (rawHash: string) => {
            let hash = rawHash ?? "";
            try {
                hash = decodeURIComponent(hash);
            } catch {
                // keep raw hash
            }
            if (!hash.startsWith("#year-")) return false;
            const el = document.getElementById(hash.slice(1));
            if (!(el instanceof HTMLDetailsElement)) return false;
            openDetails(el);
            const target = (el.querySelector("summary") as HTMLElement | null) ?? el;
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            return true;
        };

        const openLatestIfNeeded = () => {
            if (document.querySelector("details.archives-year[open]")) return;
            const latest = allYears[0];
            if (!latest) return;
            const el = document.getElementById(`year-${latest}`);
            if (el instanceof HTMLDetailsElement) openDetails(el);
        };

        createEffect(() => {
            const opened = openFromHash(location.hash);
            if (!opened) openLatestIfNeeded();
        });

        const onHashChange = () => openFromHash(window.location.hash);
        window.addEventListener("hashchange", onHashChange);
        onCleanup(() => window.removeEventListener("hashchange", onHashChange));
    });

    return (
        <SimplePageLayout page={page} lang={page.lang}>
            <p class="mt-2 mb-8 text-sm text-[var(--c-text-muted)]">
                {LL && LL().archive.ARCHIVES_SUBTITLE({ total: totalCount() })}
            </p>
            <div class="">
                <For each={allYears}>
                    {(year) => (
                        <details
                            id={`year-${year}`}
                            class="group"
                            onToggle={(e) => {
                                if (!(e as Event).isTrusted) return;
                                const details = e.currentTarget as HTMLDetailsElement;
                                if (details.open) {
                                    const targetHash = `#year-${year}`;
                                    if (window.location.hash !== targetHash) {
                                        history.replaceState(null, "", targetHash);
                                    }
                                } else if (window.location.hash === `#year-${year}`) {
                                    history.replaceState(
                                        null,
                                        "",
                                        window.location.pathname + window.location.search,
                                    );
                                }
                            }}
                        >
                            <summary class="flex items-center justify-between gap-4">
                                <h2 class="text-xl md:text-2xl font-semibold text-[var(--c-text)]">
                                    {year}
                                </h2>
                                <span class="text-[var(--c-text-subtle)]">
                                    <IconChevronRight width={18} height={18} class="" />
                                </span>
                            </summary>
                            <div class="">
                                <OtherBlogs
                                    posts={() => postsByYear[year] ?? []}
                                    description={
                                        LL && LL().archive.ARCHIVES_SUBTITLE({ total: yearCount(year) })
                                    }
                                />
                            </div>
                        </details>
                    )}
                </For>
            </div>
        </SimplePageLayout >
    )
}

export default Archives;
