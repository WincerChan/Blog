import { Accessor, For, createMemo } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import IconPointFilled from "~icons/tabler/point-filled";

const Stats = ({ LL }: { LL: Accessor<Translations> }) => {
    const elems = createMemo(() => [
        __CONTENT_TOTAL_POSTS,
        __CONTENT_TOTAL_CATEGORIES.length,
        `${(__CONTENT_WORDS / 1000).toPrecision(3)}`,
        __CONTENT_TAGS,
    ])

    return (
        <div class="space-y-3">
            <label class="text-sm uppercase tracking-wide text-[var(--c-text-subtle)]">
                {LL && LL().footer.S}
            </label>
            <div class="space-y-2 text-sm leading-relaxed">
                <For each={elems()}>
                    {(item, idx) => (
                        <p class="flex items-center gap-2">
                            <span class="text-[var(--c-text-subtle)]">
                                {LL && LL().footer.STATS[idx() as 0 | 1 | 2 | 3]()}
                            </span>
                            <IconPointFilled width={6} height={6} class="text-[var(--c-text-subtle)]" />
                            <span class="text-[var(--c-text)] font-medium tabular-nums">{item}</span>
                        </p>
                    )}
                </For>
            </div>
        </div>
    )
}

export default Stats;
