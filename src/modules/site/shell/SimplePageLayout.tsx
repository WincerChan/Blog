import { JSX } from "solid-js";
import PageShell from "./PageShell";

type SimplePage = {
    title: string;
    summary: string;
    slug: string;
    lang?: string;
};

type PageLayoutProps = {
    children: JSX.Element,
    page: SimplePage
}

const constructHeadParams = (page: SimplePage) => {
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
