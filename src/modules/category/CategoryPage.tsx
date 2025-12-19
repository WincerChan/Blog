import { useI18nContext } from "~/i18n/i18n-solid";
import OtherBlogs from "~/modules/post-listing/OtherCards";
import type { PostListItem } from "~/modules/post-listing/types";
import PageLayout from "~/layouts/PageLayout";
import { createMemo } from "solid-js";

type TaxoLayoutProps = {
    rawTaxo: {
        term: string,
        pages: PostListItem[]
    },
    type: string,
    basePath?: string
}

const constructHeadParams = (term: string, basePath: string, pages: PostListItem[]) => {
    return {
        title: `${term}`,
        date: pages[0]?.date ?? new Date().toDateString(),
        keywords: [term],
        pageURL: `${basePath}/${term}/`,
    }
}

const CategoryPage = (props: TaxoLayoutProps) => {
    const { LL } = useI18nContext()
    const basePath = () => props.basePath ?? "/category";
    const blogsByTerm = createMemo(() => props.rawTaxo.pages);
    const headParams = createMemo(() =>
        constructHeadParams(props.rawTaxo.term, basePath(), blogsByTerm()),
    );
    return (
        <PageLayout headParams={headParams()} >
            <h1 class=":: text-headline ">{LL && LL().archive.CATE()}{headParams().title}</h1>
            <OtherBlogs posts={() => blogsByTerm()} />
        </PageLayout>
    )
}

export default CategoryPage;
