import { JSX } from "solid-js";
import PageLayout from "./PageLayout";

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
        <PageLayout headParams={headParams} lang={lang}>
            {page && (
                <h1 class="mt-10 md:mt-14 mb-3 text-3xl md:text-4xl font-semibold font-serif tracking-tight leading-tight text-[var(--c-text)]">
                    {page.title}
                </h1>
            )}
            {children}
        </PageLayout>
    )
}

export default SimplePageLayout;
