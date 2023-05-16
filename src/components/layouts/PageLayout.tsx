import { JSX, Show } from "solid-js";
import { HeadParamsSchema } from "~/schema/Head";
import { BasePage } from "~/schema/Page";
import DisqusComment from "../core/section/Disqus";
import ArticleTitle from "../core/section/Title";
import LazyImg from "../lazy/Img";
import ContentLayout from "./ContentLayout";

type PageLayoutProps = {
    children: JSX.Element,
    page: BasePage
}

const constructHeadParams = (page: BasePage) => {
    return HeadParamsSchema.parse({
        title: page.title,
        description: page.summary,
        pageURL: page.slug,
    })
}

const PageLayout = ({ children, page, showComment }) => {
    const headParams = constructHeadParams(page);
    return (
        <ContentLayout headParams={headParams}>
            {page?.cover && <LazyImg class=":: w-full blog-cover rounded object-cover mb-6 " src={page.cover} alt="cover" />}
            {page && <div class="<md:mx-4"><ArticleTitle title={page.title} /></div>}
            {children}
            <Show when={showComment}>
                <DisqusComment slug={page.slug} />
            </Show>
        </ContentLayout>
    )
}

export default PageLayout;