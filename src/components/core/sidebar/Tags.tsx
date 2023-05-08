import TagCollection from "../section/Tag";
import Seprator from "./Seprator";

const Tags = () => {
    return (
        <>
            <Seprator title="标签" />
            <div class=":: flex-wrap leading-7 flex my-3 gap-3 justify-between ">
                <TagCollection tags={__TAGS} />
            </div>
        </>
    )
}
export default Tags