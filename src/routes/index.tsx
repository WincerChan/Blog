import LatestBlog from "~/modules/home/LatestCard";
import OtherBlogs from "~/modules/post-listing/OtherCards";
import PageShell from "~/modules/site/shell/PageShell";
import { getLatestPosts, postUrl } from "~/content/velite";
import { createAsync } from "@solidjs/router";
import { Show, createMemo } from "solid-js";



const Home = () => {
    const latest = createAsync(() => getLatestPosts(5));
    const recentPosts = createMemo(() =>
        (latest() ?? []).map((p) => ({
            ...p,
            slug: p.url ?? postUrl(String(p.slug)),
        })),
    );
    const date = () => recentPosts()[0]?.date;
    return (
        <PageShell headParams={{ date: date() }}>
            <Show when={recentPosts()[0]}>
                {(first) => <LatestBlog blog={first() as any} />}
            </Show>
            <OtherBlogs posts={() => recentPosts().slice(1) as any} description="近期文章" />
            <a class=":: transition leading-none duration-200 ease-linear text-link underline underline-1 underline-offset-2.5 hover:underline-[var(--menu-hover-text)] " href="/archives/">查看更多文章</a>
        </PageShell>
    );
}


export default Home
