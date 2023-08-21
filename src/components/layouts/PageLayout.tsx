import { JSX, Show } from "solid-js";
import { BasePage } from "~/schema/Page";
import DisqusComment from "../core/section/Disqus";
import ArticleTitle from "../core/section/Title";
import LazyImg from "../lazy/Img";
import ContentLayout, { ArticleLayout } from "./ContentLayout";

type PageLayoutProps = {
    children: JSX.Element,
    page: BasePage
}

const constructHeadParams = (page: BasePage) => {
    return {
        title: page.title,
        description: page.summary,
        pageURL: page.slug,
    }
}

const PageLayout = ({ children, page, showComment }) => {
    const headParams = constructHeadParams(page);
    const extra = (
        <Show when={showComment}>
            <DisqusComment slug={page.slug} />
        </Show>
    )
    return (
        <ArticleLayout headParams={headParams} extra={extra}>
            {page && <div class="<md:mx-4"><ArticleTitle title={page.title} /></div>}
            {page?.cover && <LazyImg class=":: w-full blog-cover rounded object-cover my-6 " src={page.cover} alt="cover" />}
            {children}
        </ArticleLayout>
    )
}

const ArchiveLayout = ({ children, page }) => {
    const headParams = constructHeadParams(page);
    return (
        <ContentLayout headParams={headParams}>
            {page && <div class="<md:mx-4"><ArticleTitle title={page.title} /></div>}
            {children}
        </ContentLayout>
    )
}

export default PageLayout;
export { ArchiveLayout };
