import { For, onMount } from "solid-js";

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
            <div ref={self!} class=":: w-full flex gap-4 my-6 comment ">
                <img title="avatar" class=":: rounded-lg w-10 h-10 " src="https://gravatar.loli.net/avatar/00000000000000000000000000000000?d=mp&f=y" />
                <div class=":: space-y-2 leading-relaxed font-sans text-justify ">
                    <label class="space-x-2">
                        <span class=":: font-medium text-lg ">{author}</span>
                        <span class=":: text-[var(--blockquote-text)] pl-2">{new Date(date).toLocaleString()}</span>
                    </label>
                    <div innerHTML={message} />
                </div>
            </div>
            {children && <CommentList comments={children} />}
        </>
    )
}



const CommentList = ({ comments }: { comments: CommentProps[] }) => {
    return (
        <ul>
            <For each={comments}>
                {comment => (
                    <li>
                        <Comment {...comment} />
                    </li>
                )}
            </For>
        </ul>
    )
}

export { Comment };

export default CommentList
