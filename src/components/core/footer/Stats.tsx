import Category from "@/(hugo)/category/index.json";
import { Accessor, For } from "solid-js";
import { Translations } from "~/i18n/i18n-types";

const Stats = ({ LL }: { LL: Accessor<Translations> }) => {
    const elems = [
        __TOTAL_POSTS,
        Category.pages.length,
        `${(__WORDS / 1000).toPrecision(3)}`,
        __ALL_TAGS
    ]

    return (
        <div class="">
            <label class=":: text-[15px]  font-headline text-[var(--subtitle)] ">{LL && LL().footer.S}</label>
            <div class=":: mb-6 text-[var(--extra)] ">
                <For each={elems}>
                    {(item, idx) => <p>{item}{LL && LL().footer.STATS[idx() as 0 | 1 | 2 | 3]()}</p>}
                </For>
            </div>
        </div>
    )
}

export default Stats;