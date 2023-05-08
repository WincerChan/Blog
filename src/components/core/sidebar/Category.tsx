import categoryPage from "@/_output/category/index.json";
import { For } from "solid-js";
import { A } from "solid-start";
import Seprator from "./Seprator";

const Category = () => {
    const categories = categoryPage.pages
    return (
        <>
            <Seprator title="分类" />
            <div class=":: my-3 leading-7 mb-6 ">
                <For each={categories}>
                    {(cate) => (
                        <A class=":: flex justify-between text-menuHover my-3 " inactiveClass="" activeClass="" href={`/category/${cate.title}/`}>
                            <span>{cate.title}</span>
                            <span>{cate.count}</span>
                        </A>
                    )}
                </For>
            </div >
        </>
    )
}

export default Category;