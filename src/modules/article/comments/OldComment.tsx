import { For, onMount, Show } from "solid-js";
import ReplyIcon from "~icons/tabler/arrow-forward";

interface CommentProps {
    author: string,
    date: string,
    message: string,
    id: string,
    children?: CommentProps[]
}

const Comment = ({ author, date, message, children, id }: CommentProps) => {
    let self: HTMLDivElement | null = null;
    onMount(() => {
        // add all a tag with target="_blank", rel="noopener noreferrer"
        const aTags = self!.querySelectorAll("a")
        aTags.forEach(a => {
            a.target = "_blank"
            a.classList.add("hover:text-menu-transition")
            a.rel = "noopener noreferrer"
        })
    })
    return (
        <>
            <div ref={self!} class=":: w-full my-1.5 comment leading-7 ">
                <label class="w-full space-x-2">
                    <span class=":: font-medium font-base ">{author}</span>
                    <Show when={author === "WincerChan"}><code class=":: text-base bg-[var(--copyright-bg)] rounded px-1 ">MOD</code></Show>
                    <span class=":: text-[var(--blockquote-text)] text-sm  ">{new Date(date).toLocaleString("en-us", { year: "numeric", month: "short", day: "numeric" })}</span>
                </label>
                <div class=":: text-justify text-[15px] " innerHTML={message}>
                </div>
            </div>
            <Show when={children?.length !== 0}>
                <div class=":: flex ">
                    <ReplyIcon stroke-width={1} class=":: mr-2 my-2.5 w-5 h-5 flex-none " color="var(--meta-bg)" />
                    <CommentList comments={children} />
                </div>
            </Show>
        </>
    )
}



const CommentList = ({ comments }: { comments: CommentProps[] }) => {
    return (
        <div>
            <For each={comments}>
                {comment => (
                    <Comment {...comment} />
                )}
            </For>
        </div>
    )
}

export { Comment };

export default CommentList
