import tagsPage from "~/../_output/tags/index.json";
import { shuffle } from "~/utils";
import TagCollection from "../section/Tag";
import Seprator from "./Seprator";

const tags = tagsPage.pages
const randomTags = shuffle(tags).map((tag) => tag.title).slice(0, 28)
const Tags = () => {
    return (
        <>
            <Seprator title="标签" />
            <div class="flex-wrap flex my-3 leading-10">
                <TagCollection tags={randomTags} />
            </div>
        </>
    )
}
export default Tags