import LatestBlog from "~/features/home/LatestCard";
import OtherBlogs from "~/features/post-listing/OtherCards";
import PageLayout from "~/layouts/PageLayout";
import { getLatestPosts, postUrl } from "~/content/velite";
import { Show, createMemo, createResource } from "solid-js";



const Home = () => {
    const [latest] = createResource(() => 5, () => getLatestPosts(5));
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
            <a link={true} class="" href="/archives/">查看更多文章</a>
        </PageLayout>
    );
}


export default Home
