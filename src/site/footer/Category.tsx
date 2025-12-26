import { For } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";

const Category = () => {
    const { LL } = useI18nContext()
    return (
        <div class="">
            <label class="">{LL && LL().footer.C()}</label>
            <div class="">
                <For each={__CONTENT_TOTAL_CATEGORIES as any}>
                    {(cate) => (
                        <a class="" href={`/category/${cate.title}/`}>
                            <p>{cate.title}（{cate.count}）</p>
                        </a>
                    )}
                </For>
            </div >
        </div>
    )
}

export default Category;
