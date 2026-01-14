import { useI18nContext } from "~/i18n/i18n-solid";
import OtherBlogs from "~/features/post-listing/OtherCards";
import type { PostListItem } from "~/features/post-listing/types";
import PageLayout from "~/layouts/PageLayout";
import { createMemo } from "solid-js";

type TaxoLayoutProps = {
    rawTaxo: {
        term: string,
        pages: PostListItem[]
    },
    type: string,
    basePath?: string
    inkstoneToken?: string
}

const constructHeadParams = (
    term: string,
    basePath: string,
    pages: PostListItem[],
    inkstoneToken?: string,
) => {
    const totalCount = pages.length;
    const encodedTerm = encodeURIComponent(term);
    return {
        title: `${term}`,
        date: pages[0]?.date ?? new Date().toDateString(),
        keywords: [term],
        pageURL: `${basePath}/${encodedTerm}/`,
        description: `分类 · ${term}，共 ${totalCount} 篇文章`,
        inkstoneToken,
    }
}

const CategoryPage = (props: TaxoLayoutProps) => {
    const { LL } = useI18nContext()
    const basePath = () => props.basePath ?? "/category";
    const blogsByTerm = createMemo(() => props.rawTaxo.pages);
    const totalCount = () => blogsByTerm().length;
    const headParams = createMemo(() =>
        constructHeadParams(props.rawTaxo.term, basePath(), blogsByTerm(), props.inkstoneToken),
    );
    return (
        <PageLayout headParams={headParams()} >
            <h1 class="mt-10 md:mt-14 mb-3 text-3xl md:text-4xl font-semibold font-serif tracking-tight leading-tight text-[var(--c-text)]">
                {LL && LL().archive.CATE()}{headParams().title}
            </h1>
            <p class="mt-0 mb-8 text-xl font-serif md:text-2xl text-[var(--c-text-muted)] leading-relaxed">
                {LL && LL().archive.ARCHIVES_SUBTITLE({ total: totalCount() })}
            </p>
            <OtherBlogs posts={() => blogsByTerm()} description={null} />
        </PageLayout>
    )
}

export default CategoryPage;
