import { HeadParamsSchema } from "~/schema/Head"
import { BlogMinimal } from "~/schema/Post"
import ContentLayout from "./ContentLayout"

const constructHeadParams = (page: BlogMinimal) => {
    return HeadParamsSchema.parse({
        date: page.date,
    })
}
const MainLayout = ({ children, page }) => {
    const headParmas = constructHeadParams(page)
    return (
        <ContentLayout headParams={headParmas}>
            {children}
        </ContentLayout>
    )
}

export default MainLayout