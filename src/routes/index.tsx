import posts from '@/_output/index.json';
import { Suspense, lazy } from 'solid-js';
import { A } from "solid-start";
import EmptyLayout from '~/components/layouts/EmptyLayout';
import { BlogMinimalSchema } from "~/schema/Post";

const MainLayout = lazy(() => import("~/components/layouts/MainLayout"));
const OtherBlogs = lazy(() => import("~/components/core/section/OtherCards"))
const LatestBlog = lazy(() => import("~/components/core/section/LatestCard"))

const Home = () => {
  const recentPosts = posts.pages.map((post) => BlogMinimalSchema.parse(post));
  return (
    <MainLayout page={recentPosts[0]}>
      <LatestBlog blog={recentPosts[0]} />
      <OtherBlogs posts={() => recentPosts.slice(1)} description="近期文章" />
      <A class="transition <md:mx-4 duration-200 ease-linear text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)] px-.5 text-link" href="/archives/">查看更多文章</A>
    </MainLayout>
  );
}

const LazyHome = () => {
  return <Suspense fallback={<EmptyLayout />}><Home /></Suspense>
}

export default LazyHome