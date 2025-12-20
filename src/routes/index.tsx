import LatestBlog from "~/features/home/LatestCard";
import OtherBlogs from "~/features/post-listing/OtherCards";
import PageLayout from "~/layouts/PageLayout";
import { getLatestPosts, postUrl } from "~/content/velite";
import { Show, createMemo, createResource } from "solid-js";



const Home = () => {
    const serverPosts = import.meta.env.SSR ? getLatestPosts(5) : undefined;
    const initialValue = Array.isArray(serverPosts) ? serverPosts : undefined;
    const options = initialValue
        // SSR uses initialValue to render without serializing resource data into HTML.
        ? { initialValue, ssrLoadFrom: "initial" as const }
        : undefined;
    const [latest] = createResource(() => 5, () => getLatestPosts(5), options);
    const recentPosts = createMemo(() =>
        (latest() ?? []).map((p) => ({
            ...p,
            slug: p.url ?? postUrl(String(p.slug)),
        })),
    );
    const date = () => recentPosts()[0]?.date;
    return (
        <PageLayout headParams={{ date: date() }}>
            <Show when={recentPosts()[0]}>
                {(first) => <LatestBlog blog={first() as any} />}
            </Show>
            <OtherBlogs posts={() => recentPosts().slice(1) as any} description="近期文章" />
            <a link={true} class=":: transition leading-none duration-200 ease-linear text-link underline underline-1 underline-offset-2.5 hover:underline-[var(--menu-hover-text)] " href="/archives/">查看更多文章</a>
        </PageLayout>
    );
}


export default Home
