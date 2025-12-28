import { For } from "solid-js";
import IconPointFilled from "~icons/ph/dot-outline-fill";
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
                            class="group inline-flex items-center gap-1 text-[var(--c-text-muted)] transition-colors"
                            href={`/category/${cate.title}/`}
                        >
                            <span class="group-hover:text-[var(--c-text)] group-hover:underline group-hover:decoration-[var(--c-text)] decoration-1 underline-offset-4">
                                {cate.title}
                            </span>
                            <IconPointFilled width={12} height={12} class="text-[var(--c-text-subtle)]" />
                            <span class="text-[var(--c-text)] font-medium tabular-nums">{cate.count}</span>
                        </a>
                    )}
                </For>
            </div >
        </div>
    )
}

export default Category;
