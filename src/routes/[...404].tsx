import { Meta } from "@solidjs/meta";
import ArticlePageLayout from "~/modules/article/layout/ArticlePageLayout";
import { BasePage } from "~/schema/Page";

const page: BasePage = {
    title: "404 Not Found",
    date: new Date(),
    content: "您访问的页面已经消失得无影无踪，就像我的前任一样。",
    slug: "404",
    summary: "您访问的页面已经消失得无影无踪，就像我的前任一样。"
}

export default function NotFound() {
    return (
        <>
            <Meta charset="utf-8" />
            <ArticlePageLayout rawBlog={page} relates={[]} hideComment={true}>
                <section class="md-content">
                    <p class=":: text-xl mb-8 leading-relaxed">{page.content}</p>
                </section>
            </ArticlePageLayout>
        </>
    );
}
