import { For } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";

const Category = () => {
    const { LL } = useI18nContext()
    return (
        <div class="space-y-3">
            <label class="text-sm uppercase tracking-wide text-[var(--c-text-subtle)]">
                {LL && LL().footer.C()}
            </label>
            <div class="flex flex-col gap-2 text-sm leading-relaxed">
                <For each={__CONTENT_TOTAL_CATEGORIES as any}>
                    {(cate) => (
                        <a
                            class="text-[var(--c-text-muted)] hover:text-[var(--c-link)] transition-colors"
                            href={`/category/${cate.title}/`}
                        >
                            <p>{cate.title}（{cate.count}）</p>
                        </a>
                    )}
                </For>
            </div >
        </div>
    )
}

export default Category;
