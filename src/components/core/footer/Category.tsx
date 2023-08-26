import categoryPage from "@/_output/category/index.json";
import { For } from "solid-js";
import { A } from "solid-start";
import { useI18nContext } from "~/i18n/i18n-solid";

const Category = () => {
    const { LL } = useI18nContext()
    const categories = categoryPage.pages
    return (
        <div class="">
            <label class=":: font-headline text-[var(--subtitle)] ">{LL().footer.C()}</label>
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