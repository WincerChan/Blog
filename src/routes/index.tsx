import { A } from "solid-start";
import posts from '~/../_output/index.json';
import { LatestBlog, OtherBlogs } from "~/components/core/section/Card";
import MainLayout from "~/components/layouts/MainLayout";
import { BlogMinimalSchema } from "~/schema/Post";

export default function Home() {
  const recentPosts = posts.pages.map((post) => BlogMinimalSchema.parse(post));
  return (
    <MainLayout page={recentPosts[0]}>
      <LatestBlog blog={recentPosts[0]} />
      <OtherBlogs posts={recentPosts.slice(1)} description="近期文章" />
      <A class="transition <md:mx-4 duration-200 ease-linear text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)] px-.5 text-link" href="/archives/">查看更多文章</A>
    </MainLayout>
  );
}
