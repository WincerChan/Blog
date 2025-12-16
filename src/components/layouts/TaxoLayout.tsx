import { useI18nContext } from "~/i18n/i18n-solid";
import { BlogMinimal } from "~/schema/Post";
import OtherBlogs from "../core/section/OtherCards";
import ContentLayout from "./ContentLayout";

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

const TaxoLayout = ({ rawTaxo, type, basePath = "/tags" }: TaxoLayoutProps) => {
    const { LL } = useI18nContext()
    const blogsByTerm = rawTaxo.pages;
    const headParams = constructHeadParams(rawTaxo.term, basePath, blogsByTerm);
    return (
        <ContentLayout headParams={headParams} >
            <h1 class=":: text-headline ">{LL && LL().archive.CATE()}{headParams.title}</h1>
            <OtherBlogs posts={() => blogsByTerm} />
        </ContentLayout>
    )
}

export default TaxoLayout;
