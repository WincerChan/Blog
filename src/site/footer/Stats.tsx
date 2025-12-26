import { Accessor, For, createMemo } from "solid-js";
import { Translations } from "~/i18n/i18n-types";

const Stats = ({ LL }: { LL: Accessor<Translations> }) => {
    const elems = createMemo(() => [
        __CONTENT_TOTAL_POSTS,
        __CONTENT_TOTAL_CATEGORIES.length,
        `${(__CONTENT_WORDS / 1000).toPrecision(3)}`,
        __CONTENT_TAGS,
    ])

    return (
        <div class="space-y-3">
            <label class="text-xs uppercase tracking-wide text-[var(--c-text-subtle)]">
                {LL && LL().footer.S}
            </label>
            <div class="space-y-2 text-sm leading-relaxed text-[var(--c-text-muted)]">
                <For each={elems()}>
                    {(item, idx) => <p>{item}{LL && LL().footer.STATS[idx() as 0 | 1 | 2 | 3]()}</p>}
                </For>
            </div>
        </div>
    )
}

export default Stats;
