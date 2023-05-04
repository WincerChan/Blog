import TagCollection from "../section/Tag";
import Seprator from "./Seprator";

const Tags = () => {
    return (
        <>
            <Seprator title="标签" />
            <div class="flex-wrap flex my-3 leading-10">
                <TagCollection tags={__TAGS} />
            </div>
        </>
    )
}
export default Tags