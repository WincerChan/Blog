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
        if (!self) return;
        // add all a tag with target="_blank", rel="noopener noreferrer"
        const aTags = self.querySelectorAll("a")
        aTags.forEach(a => {
            a.target = "_blank"
            a.classList.add(
                "hover:text-menu-active",
                "hover:underline",
                "hover:decoration-1",
                "hover:underline-offset-4",
            )
            a.rel = "noopener noreferrer"
        })
    })
    return (
        <>
            <div ref={self!} class=":: w-full comment leading-7 py-3 border-b border-[var(--blockquote-border)]/60 ">
                <label class=":: w-full flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span class=":: font-semibold text-base ">{author}</span>
                    <Show when={author === "WincerChan"}><code class=":: text-base bg-[var(--copyright-bg)] rounded px-1 ">MOD</code></Show>
                    <time class=":: text-[var(--blockquote-text)] text-xs " dateTime={new Date(date).toISOString()}>
                        {new Date(date).toLocaleString("en-us", { year: "numeric", month: "short", day: "numeric" })}
                    </time>
                </label>
                <div class=":: mt-1 text-justify text-[15px] leading-relaxed " innerHTML={message}>
                </div>
            </div>
            <Show when={children?.length}>
                <div class=":: flex my-2 pl-1 ">
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
