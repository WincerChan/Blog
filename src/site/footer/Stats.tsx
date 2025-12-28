import { Accessor, For, createMemo } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import IconPointFilled from "~icons/ph/dot-outline-fill";

const formatWordCount = (value: unknown) => {
    const total = Number(value);
    if (!Number.isFinite(total)) return "0";
    if (total < 1000) return String(Math.max(0, Math.floor(total)));
    return `${Math.max(1, Math.round(total / 1000))}k`;
};

const Stats = ({ LL }: { LL: Accessor<Translations> }) => {
    const elems = createMemo(() => [
        __CONTENT_TOTAL_POSTS,
        __CONTENT_TOTAL_CATEGORIES.length,
        formatWordCount(__CONTENT_WORDS),
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
                        <p class="flex items-center gap-1">
                            <span class="text-[var(--c-text-subtle)]">
                                {LL && LL().footer.STATS[idx() as 0 | 1 | 2 | 3]()}
                            </span>
                            <IconPointFilled width={12} height={12} class="text-[var(--c-text-subtle)]" />
                            <span class="text-[var(--c-text)] font-medium tabular-nums">{item}</span>
                        </p>
                    )}
                </For>
            </div>
        </div>
    )
}

export default Stats;
