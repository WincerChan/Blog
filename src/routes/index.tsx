import LatestBlog from "~/modules/home/LatestCard";
import OtherBlogs from "~/modules/post-listing/OtherCards";
import PageShell from "~/modules/site/shell/PageShell";
import { getLatestPosts, postUrl } from "~/content/velite";



const Home = () => {
    const recentPosts = getLatestPosts(5).map((p) => ({
        ...p,
        slug: postUrl(p.slug),
    }));
    const date = recentPosts[0]?.date
    return (
        <PageShell headParams={{ date: date }}>
            {recentPosts[0] && <LatestBlog blog={recentPosts[0]} />}
            <OtherBlogs posts={() => recentPosts.slice(1)} description="近期文章" />
            <a class=":: transition leading-none duration-200 ease-linear text-link underline underline-1 underline-offset-2.5 hover:underline-[var(--menu-hover-text)] " href="/archives/">查看更多文章</a>
        </PageShell>
    );
}


export default Home
