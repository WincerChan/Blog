import { For } from "solid-js";
import OtherBlogs from "~/components/core/section/OtherCards";
import { ArchiveLayout } from "~/components/layouts/PageLayout";

const Archives = ({ page }) => {
    const postsByYear = __POSTS_BY_YEAR_DETAIL;
    const allYears = Object.keys(postsByYear)
        .filter((x) => x !== "undefined")
        .sort((a, b) => Number(b) - Number(a));

    return (
        <ArchiveLayout page={page} lang={page.lang}>
            <div
                id="post-meta"
                class=":: font-mono text-base flex overflow-x-scroll hyphens-auto whitespace-nowrap space-x-4 mt-4 mb-6 "
            >
                <For each={allYears}>
                    {(year) => (
                        <a
                            class=":: border rounded py-2 px-4 hover:text-menu-transition"
                            href={`#year-${year}`}
                            title={year}
                        >
                            {year}
                        </a>
                    )}
                </For>
            </div>
            <For each={allYears}>
                {(year) => (
                    <section>
                        <h2 id={`year-${year}`} class=":: font-headline text-3xl mt-8 ">
                            <a class="hover:text-menu-transition" href={`#year-${year}`}>
                                {year}
                            </a>
                        </h2>
                        <OtherBlogs posts={() => postsByYear[year] ?? []} description={null} />
                    </section>
                )}
            </For>
        </ArchiveLayout >
    )
}

export default Archives;
