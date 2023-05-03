import Category from "~/../_output/category/index.json";
import blogs from "~/../_output/posts/index.json";
import { BlogMinimalSchema } from "~/schema/Post";
import Seprator from "./Seprator";

const Stats = () => {
    const posts = blogs.pages.map((post) => (
        BlogMinimalSchema.parse(post)
    ))
    const wordsCount = posts.reduce((acc, post) => {
        return acc + post.words
    }, 0)
    return (
        <div class="<sm:hidden">
            <Seprator title="统计" />
            <div class="flex justify-between w-full my-3 leading-8 mb-6">
                <div class="text-center">
                    <p>{posts.length}</p>
                    <span>文章</span>
                </div>
                <div class="text-center">
                    <p>{Category.pages.length}</p>
                    <span>分类</span>
                </div>
                <div class="text-center">
                    <p>{(wordsCount / 10000).toPrecision(3)}</p>
                    <span>万字</span>
                </div>
            </div>
        </div>
    )
}

export default Stats;