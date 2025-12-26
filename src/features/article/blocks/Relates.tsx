import { Accessor, For, Show } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import type { RelatedPost } from "~/features/article/types";
import { formatDate } from "~/utils";
import IconBadge from "~icons/carbon/badge";


const Relates = ({ relates, LL }: { relates: RelatedPost[], LL: Accessor<Translations> }) => {
    return (
        <Show when={relates.length}>
            <div>
                <label class=""> {LL && LL().post.RELATES}</label>
                <ol class="">
                    <For each={relates}>
                        {(post, idx) => (
                            <li>
                                <p class="">{formatDate(post.date)}</p>
                                <a class="" href={post.slug}>{post.title} {(post.score >= 1 && idx() < 3) && <IconBadge width={20} height={20} class="" />}</a>
                            </li>
                        )}
                    </For>
                </ol>
            </div>
        </Show>
    )
}

export default Relates;
