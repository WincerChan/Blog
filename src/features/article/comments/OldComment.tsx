import { For, onMount, Show } from "solid-js";

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
            <div ref={self!} class="">
                <label class="">
                    <span class="">{author}</span>
                    <Show when={author === "WincerChan"}><code class="">MOD</code></Show>
                    <time class="" dateTime={new Date(date).toISOString()}>
                        {new Date(date).toLocaleString("en-us", { year: "numeric", month: "short", day: "numeric" })}
                    </time>
                </label>
                <div class="" innerHTML={message}>
                </div>
            </div>
            <Show when={children?.length}>
                <div class="">
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
