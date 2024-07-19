import { A } from "@solidjs/router";
import { Accessor, For, Show } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import { BlogScore } from "~/schema/Post";
import { formatDate } from "~/utils";
import IconBadge from "~icons/carbon/badge";


const Relates = ({ relates, LL }: { relates: BlogScore[], LL: Accessor<Translations> }) => {
    return (
        <Show when={relates.length}>
            <div>
                <label class=":: text-[15px]  font-headline text-[var(--subtitle)]"> {LL && LL().post.RELATES}</label>
                <ol class=":: gap-6 text-lg mt-4 grid grid-cols-2 ">
                    <For each={relates}>
                        {(post, idx) => (
                            <li>
                                <p class="text-base">{formatDate(post.date)}</p>
                                <A class=":: leading-relaxed hover:text-menu-transition break-all text-ellipsis" href={post.slug}>{post.title} {(post.score >= 1 && idx() < 3) && <IconBadge width={20} height={20} class="inline" />}</A>
                            </li>
                        )}
                    </For>
                </ol>
            </div>
        </Show>
    )
}

export default Relates;