import tagsPage from "~/../_output/tags/index.json";
import TagCollection from "../section/Tag";
import Seprator from "./Seprator";

const Tags = () => {
    const tags = tagsPage.pages.map((tag) => tag.title).slice(0, 28)

    return (
        <>
            <Seprator title="标签" />
            <div class="flex-wrap flex my-3 leading-10">
                <TagCollection tags={tags} />
            </div>
        </>
    )
}
export default Tags