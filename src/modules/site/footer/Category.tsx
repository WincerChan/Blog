import { createAsync } from "@solidjs/router";
import { For, createMemo } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import { getCategoryIndex } from "~/content/velite";

const Category = () => {
    const { LL } = useI18nContext()
    const categories = createAsync(() => getCategoryIndex())
    const resolved = createMemo(() =>
        categories() ?? [],
    );
    return (
        <div class="">
            <label class=":: text-[15px]  font-headline text-[var(--subtitle)]  ">{LL && LL().footer.C()}</label>
            <div class=":: mb-6 md:w-48 md:grid text-[var(--extra)]  grid-rows-4 grid-flow-col gap-x-4 ">
                <For each={resolved() as any}>
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
