import { For } from "solid-js";
import { A } from "solid-start";
import { BlogScore } from "~/schema/Post";
import { formatDate } from "~/utils";
import Seprator from "../sidebar/Seprator";


const Relates = ({ relates }: { relates: BlogScore[] }) => {
    return (
        <div class="">
            <Seprator title="相关文章" />
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