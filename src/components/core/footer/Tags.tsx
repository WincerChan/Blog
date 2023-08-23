import TagCollection from "../section/Tag";
import Seprator from "../sidebar/Seprator";

const Tags = () => {
    return (
        <div class="<md:hidden basis-1/4">
            <Seprator title="标签" />
            <div class=":: flex-wrap gap-x-3 flex justify-between ">
                <TagCollection tags={__TAGS} />
            </div>
        </div>
    )
}
export default Tags