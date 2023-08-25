import archPage from "@/_output/base/archives/index.json";
import postsPage from "@/_output/posts/index.json";
import { For, createMemo, createSignal, onMount } from "solid-js";
import { useSearchParams } from "solid-start";
import OtherBlogs from "~/components/core/section/OtherCards";
import { ArchiveLayout } from "~/components/layouts/PageLayout";
import { BlogMinimal } from "~/schema/Post";


const groupByYear = (posts: BlogMinimal[]) => {
    let byYears: { [key: string]: BlogMinimal[] } = {};
    posts.forEach((post) => {
        const year = new Date(post.date).getFullYear()
        if (!byYears[year]) byYears[`${year}`] = [];
        byYears[year].push({ ...post, slug: `/posts/${post.slug}/` })
    })
    return byYears
}

const YearArchive = ({ posts, year, ...props }: { posts: BlogMinimal[], year: string }) => {
    return (
        <>
            <h2 id={year()} class=":: font-headline text-3xl mt-8 ">
                <a href={`#${year()}`}>{year}</a>
            </h2>
            <OtherBlogs posts={posts} />
        </>
    )
}

const Archives = () => {
    const posts = groupByYear(postsPage.pages)
    const allYears = Object.keys(posts).sort((a, b) => (Number(b) - Number(a)))
    const [activeYear, setActiveYear] = createSignal(allYears[0])
    const [searchParams, setSearchParams] = useSearchParams()
    const activePosts = createMemo(() => posts[activeYear()] || [])

    onMount(() => {
        const year = searchParams.year
        if (!year) return
        setActiveYear(year)

    })
    const updateActivePosts = (year) => {
        setSearchParams({ year })
        setActiveYear(year)
    }
    // 规范化之后的页面

    return (
        <ArchiveLayout page={archPage}>
            <div id="post-meta" class=":: font-mono text-base flex overflow-x-scroll hyphens-auto whitespace-nowrap  space-x-4 scrollbar-none mt-4 mb-6 ">
                <For each={allYears}>
                    {(year, index) => (
                        <button title={year} onClick={() => updateActivePosts(year)} class=":: border rounded py-2 px-4 ">{year}</button>
                    )}
                </For>
            </div>
            <YearArchive posts={activePosts} year={activeYear} />
        </ArchiveLayout >
    )
}

export default Archives;
