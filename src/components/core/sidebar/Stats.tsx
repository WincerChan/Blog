import Category from "@/_output/category/index.json";
import Seprator from "./Seprator";

const Stats = () => {
    return (
        <div class="<sm:hidden">
            <Seprator title="统计" />
            <div class=":: flex justify-between w-full my-3 leading-7 mb-6 ">
                <div class="text-center">
                    <p>{__TOTAL_POSTS}</p>
                    <span>文章</span>
                </div>
                <div class="text-center">
                    <p>{Category.pages.length}</p>
                    <span>分类</span>
                </div>
                <div class="text-center">
                    <p>{(__WORDS / 10000).toPrecision(3)}</p>
                    <span>万字</span>
                </div>
            </div>
        </div>
    )
}

export default Stats;