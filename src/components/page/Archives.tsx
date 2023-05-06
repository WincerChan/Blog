import archPage from "@/_output/base/archives/index.json";
import postsPage from "@/_output/posts/index.json";
import { For, createSignal } from "solid-js";
import OtherBlogs from "~/components/core/section/OtherCards";
import PageLayout from "~/components/layouts/PageLayout";
import { PageSchema } from "~/schema/Page";
import { BlogMinimal, BlogMinimalSchema } from "~/schema/Post";


const groupByYear = (posts: BlogMinimal[]) => {
    let byYears: { [key: string]: BlogMinimal[] } = {};
    posts.forEach((post) => {
        const year = post.date.getFullYear()
        if (!byYears[year]) byYears[`${year}`] = [];
        post.slug = `/posts/${post.slug}/`
        byYears[year].push(post)
    })
    return byYears
}

const YearArchive = ({ posts, year, ...props }: { posts: BlogMinimal[], year: string }) => {
    return (
        <>
            <h2 id={year()} class="font-headline text-2xl mt-4 <md:mx-4">
                <a href={`#${year()}`}>{year}</a>
            </h2>
            <OtherBlogs posts={posts} />
        </>
    )
}

const Archives = () => {
    const posts = groupByYear(postsPage.pages.map((post) => BlogMinimalSchema.parse(post)))
    const allYears = Object.keys(posts).sort((a, b) => (Number(b) - Number(a)))
    const [activeYear, setActiveYear] = createSignal(allYears[0])
    const [activePosts, setActivePosts] = createSignal(posts[allYears[0]] || [])

    const updateActivePosts = (year) => {
        setActiveYear(year)
        setActivePosts(posts[year] || [])
    }
    // 规范化之后的页面
    return (
        <PageLayout page={PageSchema.parse(archPage)} showComment={false}>
            <div class=":: font-mono <md:mx-4 text-base flex overflow-x-scroll hyphens-auto whitespace-nowrap  space-x-4 scrollbar-none mt-4 mb-6 ">
                <For each={allYears}>
                    {(year, index) => (
                        <button title={year} onClick={() => updateActivePosts(year)} class="border rounded py-2 px-4">{year}</button>
                    )}
                </For>
            </div>
            <YearArchive posts={activePosts} year={activeYear} />
        </PageLayout >
    )
}

export default Archives;
