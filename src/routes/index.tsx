import LatestBlog from '~/components/core/section/LatestCard';
import OtherBlogs from '~/components/core/section/OtherCards';
import ContentLayout from '~/components/layouts/ContentLayout';
import { getLatestPosts, postUrl } from "~/content/velite";



const Home = () => {
    const recentPosts = getLatestPosts(5).map((p) => ({
        ...p,
        slug: postUrl(p.slug),
    }));
    const date = recentPosts[0]?.date
    return (
        <ContentLayout headParams={{ date: date }}>
            {recentPosts[0] && <LatestBlog blog={recentPosts[0]} />}
            <OtherBlogs posts={() => recentPosts.slice(1)} description="近期文章" />
            <a class=":: transition leading-none duration-200 ease-linear text-link underline underline-1 underline-offset-2.5 hover:underline-[var(--menu-hover-text)] " href="/archives/">查看更多文章</a>
        </ContentLayout>
    );
}


export default Home
