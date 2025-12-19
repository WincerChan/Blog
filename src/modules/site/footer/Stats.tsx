import { createAsync } from "@solidjs/router";
import { Accessor, For, createMemo } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import { getCategoryIndex } from "~/content/velite";

const Stats = ({ LL }: { LL: Accessor<Translations> }) => {
    const categories = createAsync(() => getCategoryIndex())
    const elems = createMemo(() => [
        __CONTENT_TOTAL_POSTS,
        (categories() ?? []).length,
        `${(__CONTENT_WORDS / 1000).toPrecision(3)}`,
        __CONTENT_TAGS,
    ])

    return (
        <div class="">
            <label class=":: text-[15px]  font-headline text-[var(--subtitle)] ">{LL && LL().footer.S}</label>
            <div class=":: mb-6 text-[var(--extra)] ">
                <For each={elems()}>
                    {(item, idx) => <p>{item}{LL && LL().footer.STATS[idx() as 0 | 1 | 2 | 3]()}</p>}
                </For>
            </div>
        </div>
    )
}

export default Stats;
