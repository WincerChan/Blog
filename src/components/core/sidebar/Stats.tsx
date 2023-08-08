import Category from "@/_output/category/index.json";
import Seprator from "./Seprator";

const Stats = () => {
    return (
        <div class="w-full">
            <Seprator title="统计" />
            <div class=":: mb-6 w-24 text-[var(--extra)] ">
                <div class="flex justify-between">
                    <p>{__TOTAL_POSTS} 文章</p>
                </div>
                <div class="flex justify-between">
                    <p>{Category.pages.length} 分类</p>
                </div>
                <div class="flex justify-between">
                    <p>{(__WORDS / 10000).toPrecision(3)} 万字</p>
                </div>
                <div class="flex justify-between">
                    <p>{__ALL_TAGS} 标签</p>
                </div>
            </div>
        </div>
    )
}

export default Stats;