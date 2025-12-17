import { JSX } from "solid-js";
import { BasePage } from "~/schema/Page";
import PageShell from "../shell/PageShell";

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

const SimplePageLayout = ({ children, page, lang }) => {
    const headParams = constructHeadParams(page);
    return (
        <PageShell headParams={headParams} lang={lang}>
            {page && <h1 class=":: text-headline ">{page.title}</h1>}
            {children}
        </PageShell>
    )
}

export default SimplePageLayout;
