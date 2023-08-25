import { Accessor, For } from "solid-js";
import { A } from "solid-start";
import { Translations } from "~/i18n/i18n-types";
import { BlogScore } from "~/schema/Post";
import { formatDate } from "~/utils";


const Relates = ({ relates, LL }: { relates: BlogScore[], LL: Accessor<Translations> }) => {
    return (
        <div class="">
            <label class=":: font-headline text-[var(--subtitle)]"> {LL().post.RELATES}</label>
            <ol class=":: gap-6 text-lg mt-4 grid grid-cols-2 ">
                <For each={relates}>
                    {(post, idx) => (
                        <li>
                            <p class="text-base">{formatDate(post.date)}</p>
                            <A class=":: leading-relaxed text-menuHover break-all text-ellipsis" href={post.slug}>{post.title} {(post.score >= 1 && idx() < 3) && <i title="badge" class="i-carbon-badge mb-1" />}</A>
                        </li>
                    )}
                </For>
            </ol>
        </div>
    )
}

export default Relates;