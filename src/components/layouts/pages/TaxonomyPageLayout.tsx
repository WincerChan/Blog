import { useI18nContext } from "~/i18n/i18n-solid";
import { BlogMinimal } from "~/schema/Post";
import OtherBlogs from "~/components/core/section/OtherCards";
import PageShell from "../shell/PageShell";

type TaxoLayoutProps = {
    rawTaxo: {
        term: string,
        pages: BlogMinimal[]
    },
    type: string,
    basePath?: string
}

const constructHeadParams = (term: string, basePath: string, pages: BlogMinimal[]) => {
    return {
        title: `${term}`,
        date: pages[0].date,
        keywords: [term],
        pageURL: `${basePath}/${term}/`,
    }
}

const TaxonomyPageLayout = ({ rawTaxo, type, basePath = "/category" }: TaxoLayoutProps) => {
    const { LL } = useI18nContext()
    const blogsByTerm = rawTaxo.pages;
    const headParams = constructHeadParams(rawTaxo.term, basePath, blogsByTerm);
    return (
        <PageShell headParams={headParams} >
            <h1 class=":: text-headline ">{LL && LL().archive.CATE()}{headParams.title}</h1>
            <OtherBlogs posts={() => blogsByTerm} />
        </PageShell>
    )
}

export default TaxonomyPageLayout;
