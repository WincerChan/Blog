import { HeadParamsSchema } from "~/schema/Head";
import { BlogMinimal, BlogMinimalSchema } from "~/schema/Post";
import OtherBlogs from "../core/section/OtherCards";
import ArticleTitle from "../core/section/Title";
import ContentLayout from "./ContentLayout";

type TaxoLayoutProps = {
    rawTaxo: {
        term: string,
        pages: BlogMinimal[]
    },
    type: string
}

const constructHeadParams = (term: string, type: string, pages: BlogMinimal[]) => {
    return HeadParamsSchema.parse({
        title: `${type}: ${term}`,
        date: pages[0].date,
        keywords: [term],
        pageURL: `/tags/${term}/`,
    })
}

const TaxoLayout = ({ rawTaxo, type }: TaxoLayoutProps) => {
    const blogsByTerm = rawTaxo.pages.map((blog) => BlogMinimalSchema.parse(blog));
    const headParams = constructHeadParams(rawTaxo.term, type, blogsByTerm);
    return (
        <ContentLayout headParams={headParams} >
            <div class="<md:mx-4"><ArticleTitle title={headParams.title} /></div>
            <OtherBlogs posts={() => blogsByTerm} />
        </ContentLayout>
    )
}

export default TaxoLayout;