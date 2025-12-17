import { useLocation } from "@solidjs/router";
import { For, createEffect, onCleanup, onMount } from "solid-js";
import OtherBlogs from "~/components/core/section/OtherCards";
import SimplePageLayout from "~/components/layouts/pages/SimplePageLayout";

const Archives = ({ page }) => {
    const location = useLocation();
    const postsByYear = __POSTS_BY_YEAR_DETAIL;
    const allYears = Object.keys(postsByYear)
        .filter((x) => x !== "undefined")
        .sort((a, b) => Number(b) - Number(a));

    const isZh = String(page?.lang ?? "").startsWith("zh");
    const formatCount = (count: number) => (isZh ? `${count} 篇` : `${count} posts`);
    const yearCount = (year: string) => (postsByYear?.[year]?.length ?? 0) as number;

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
            <div class=":: mt-6 ">
                <For each={allYears}>
                    {(year) => (
                        <details
                            id={`year-${year}`}
                            class="archives-year :: mb-6 last:mb-0"
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
                            <summary class=":: cursor-pointer select-none">
                                <h2 class=":: font-headline text-3xl leading-loose">
                                    <span class=":: inline-flex items-center gap-2">
                                        <span class="archives-year__chevron :: inline-block transition-transform select-none text-[var(--extra)]">
                                            ▸
                                        </span>
                                        <span class="hover:text-menu-transition">{year}</span>
                                        <span class=":: ml-2 text-base font-mono text-[var(--extra)]">
                                            {formatCount(yearCount(year))}
                                        </span>
                                    </span>
                                </h2>
                            </summary>
                            <div class=":: pt-2 ">
                                <OtherBlogs posts={() => postsByYear[year] ?? []} description={null} />
                            </div>
                        </details>
                    )}
                </For>
            </div>
        </SimplePageLayout >
    )
}

export default Archives;
