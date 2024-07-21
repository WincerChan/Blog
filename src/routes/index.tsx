import posts from '@/(hugo)/index.json';
import LatestBlog from '~/components/core/section/LatestCard';
import OtherBlogs from '~/components/core/section/OtherCards';
import ContentLayout from '~/components/layouts/ContentLayout';



const Home = () => {
    const recentPosts = posts.pages
    const date = recentPosts[0].date
    return (
        <ContentLayout headParams={{ date: date }}>
            <LatestBlog blog={recentPosts[0]} />
            <OtherBlogs posts={() => recentPosts.slice(1)} description="近期文章" />
            <a class=":: transition duration-200 ease-linear text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)] text-link " href="/archives/">查看更多文章</a>
        </ContentLayout>
    );
}


export default Home