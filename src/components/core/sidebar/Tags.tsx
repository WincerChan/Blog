import TagCollection from "../section/Tag";
import Seprator from "./Seprator";

const Tags = () => {
    return (
        <div class="w-full <md:hidden">
            <Seprator title="标签" />
            <div class=":: flex-wrap gap-x-3 flex justify-between ">
                <TagCollection tags={__TAGS} />
            </div>
        </div>
    )
}
export default Tags