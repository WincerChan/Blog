import { For } from "solid-js";
import { A } from "solid-start";
import { BlogScore } from "~/schema/Post";
import { formatDate } from "~/utils";
import Seprator from "./Seprator";


const Relates = ({ relates }: { relates: BlogScore[] }) => {
    return (
        <div class="<md:mx-4">
            <Seprator title="相关文章" />
            <ol class="my-3 mb-6 space-y-3">
                <For each={relates}>
                    {(post, idx) => (
                        <li>
                            <p class="text-[14px]">{formatDate(post.date)}</p>
                            <A class="leading-relaxed text-menuHover" href={post.slug}>{post.title} {(post.score >= 1 && idx() < 3) && <i title="badge" class="i-carbon-badge mb-1" />}</A>
                        </li>
                    )}
                </For>
            </ol>
        </div>
    )
}

export default Relates;