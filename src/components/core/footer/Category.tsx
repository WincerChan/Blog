import categoryPage from "@/_output/category/index.json";
import { For } from "solid-js";
import { A } from "solid-start";
import Seprator from "../sidebar/Seprator";

const Category = () => {
    const categories = categoryPage.pages
    return (
        <div class="max-w-1/3">
            <Seprator title="分类" />
            <div class=":: mb-6">
                <For each={categories}>
                    {(cate) => (
                        <A class=":: text-menuHover " inactiveClass="" activeClass="" href={`/category/${cate.title}/`}>
                            <p>{cate.title}（{cate.count}）</p>
                        </A>
                    )}
                </For>
            </div >
        </div>
    )
}

export default Category;