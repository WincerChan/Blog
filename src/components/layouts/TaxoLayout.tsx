import { BlogMinimal } from "~/schema/Post";
import OtherBlogs from "../core/section/OtherCards";
import ContentLayout from "./ContentLayout";

type TaxoLayoutProps = {
    rawTaxo: {
        term: string,
        pages: BlogMinimal[]
    },
    type: string
}

const constructHeadParams = (term: string, type: string, pages: BlogMinimal[]) => {
    return {
        title: `${type}: ${term}`,
        date: pages[0].date,
        keywords: [term],
        pageURL: `/tags/${term}/`,
    }
}

const TaxoLayout = ({ rawTaxo, type }: TaxoLayoutProps) => {
    const blogsByTerm = rawTaxo.pages;
    const headParams = constructHeadParams(rawTaxo.term, type, blogsByTerm);
    return (
        <ContentLayout headParams={headParams} >
            <div class="<md:mx-4">
                <h1 class=":: font-headline leading-loose title-responsive ">{headParams.title}</h1>
            </div>
            <OtherBlogs posts={() => blogsByTerm} />
        </ContentLayout>
    )
}

export default TaxoLayout;