import { Meta, Title } from "solid-start";
import ArticleTitle from "~/components/core/section/Title";
import { SideBar } from "~/components/core/sidebar";

export default function NotFound() {
  return (
    <>
      <article class=":: mb-4 article-responsive ">
        <Meta charset="utf-8" />
        <Title>404 · Wincer's Blog</Title>
        <ArticleTitle title="404 Not Found" />
        <h2 class="text-xl">您访问的页面已经消失得无影无踪，就像我的前任一样。</h2>
      </article>
      <SideBar />
    </>
  );
}
