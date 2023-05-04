import { JSX } from "solid-js";
import { HeadParamsSchema } from "~/schema/Head";
import { BasePage } from "~/schema/Page";
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
        description: page.content.slice(0, 68),
        pageURL: page.slug
    })
}

const PageLayout = ({ children, page }) => {
    const headParams = constructHeadParams(page);
    return (
        <ContentLayout headParams={headParams}>
            {page?.cover && <LazyImg class="w-full blog-cover rounded object-cover mb-6" src={page.cover} alt="cover" />}
            {page && <ArticleTitle title={page.title} />}
            {children}
        </ContentLayout>
    )
}

export default PageLayout;