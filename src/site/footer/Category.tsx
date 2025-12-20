import { For } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";

const Category = () => {
    const { LL } = useI18nContext()
    return (
        <div class="">
            <label class=":: text-[15px]  font-headline text-[var(--subtitle)]  ">{LL && LL().footer.C()}</label>
            <div class=":: mb-6 md:w-48 md:grid text-[var(--extra)]  grid-rows-4 grid-flow-col gap-x-4 ">
                <For each={__CONTENT_TOTAL_CATEGORIES as any}>
                    {(cate) => (
                        <a class=":: hover:text-menu-active hover:underline hover:decoration-1 hover:underline-offset-4 " href={`/category/${cate.title}/`}>
                            <p>{cate.title}（{cate.count}）</p>
                        </a>
                    )}
                </For>
            </div >
        </div>
    )
}

export default Category;
