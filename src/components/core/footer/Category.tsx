import categoryPage from "@/(hugo)/category/index.json";
import { For } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";

const Category = () => {
    const { LL } = useI18nContext()
    const categories = categoryPage.pages
    return (
        <div class="">
            <label class=":: text-[15px]  font-headline text-[var(--subtitle)]  ">{LL && LL().footer.C()}</label>
            <div class=":: mb-6 md:w-48 md:grid text-[var(--extra)]  grid-rows-4 grid-flow-col gap-x-4 ">
                <For each={categories}>
                    {(cate) => (
                        <a class=":: hover:text-menu-transition " href={`/category/${cate.title}/`}>
                            <p>{cate.title}（{cate.count}）</p>
                        </a>
                    )}
                </For>
            </div >
        </div>
    )
}

export default Category;