import { JSX } from "solid-js";
import { BasePage } from "~/schema/Page";
import ContentLayout from "./ContentLayout";

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

const ArchiveLayout = ({ children, page }) => {
    const headParams = constructHeadParams(page);
    return (
        <ContentLayout headParams={headParams}>
            {page && <h1 class=":: font-headline leading-loose title-responsive ">{page.title}</h1>}

            {children}
        </ContentLayout>
    )
}

export { ArchiveLayout };
