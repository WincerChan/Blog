import { Meta } from "@solidjs/meta";
import ArticlePage from "~/layouts/ArticlePage";

const page = {
    title: "404 Not Found",
    date: new Date().toDateString(),
    updated: new Date().toDateString(),
    cover: "",
    tags: [],
    category: "",
    words: 0,
    toc: "",
    neighbours: {},
    content: "您访问的页面已经消失得无影无踪，就像我的前任一样。",
    slug: "404",
    summary: "您访问的页面已经消失得无影无踪，就像我的前任一样。",
};

export default function NotFoundRoute() {
    return (
        <>
            <Meta charset="utf-8" />
            <ArticlePage rawBlog={page} relates={[]} hideComment={true}>
                <section class="">
                    <p class="">{page.content}</p>
                </section>
            </ArticlePage>
        </>
    );
}
