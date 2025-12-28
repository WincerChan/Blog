import { For, onMount, Show } from "solid-js";
import IconPointFilled from "~icons/ph/dot-outline-fill";
import IconShieldCheck from "~icons/ph/shield-check";

interface CommentProps {
    author: string,
    date: string,
    message: string,
    id: string,
    children?: CommentProps[]
}

const Comment = ({ author, date, message, children, id }: CommentProps) => {
    let self: HTMLDivElement | null = null;
    const initial = (value: string) => {
        const trimmed = String(value ?? "").trim();
        if (!trimmed) return "?";
        return Array.from(trimmed)[0] ?? "?";
    };
    const formatDateISO = (value: string) => {
        const dateObj = new Date(value);
        if (!dateObj || Number.isNaN(dateObj.getTime())) return String(value ?? "");
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    onMount(() => {
        if (!self) return;
        // add all a tag with target="_blank", rel="noopener noreferrer"
        const aTags = self.querySelectorAll("a")
        aTags.forEach(a => {
            a.target = "_blank"
            a.classList.add(
                "hover:text-[var(--c-link)]",
                "hover:underline",
                "hover:decoration-1",
                "hover:underline-offset-4",
            )
            a.rel = "noopener noreferrer"
        })
    })
    return (
        <>
            <div ref={self!} class="flex flex-col gap-2">
                <div class="flex items-center gap-3">
                    <div class="h-6 w-6 shrink-0 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-xs font-medium text-[var(--c-text)] flex items-center justify-center">
                        {initial(author)}
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2 text-sm text-[var(--c-text-subtle)]">
                            <span class="text-[var(--c-text)] font-semibold">{author}</span>
                            <Show when={author?.toLowerCase() === "wincerchan"}>
                                <span class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono text-[var(--c-link)] bg-[var(--c-selection)]">
                                    <IconShieldCheck class="h-3.5 w-3.5" />
                                    Author
                                </span>
                            </Show>
                            <time class="font-mono tabular-nums" dateTime={formatDateISO(date)}>
                                {formatDateISO(date)}
                            </time>
                        </div>
                    </div>
                </div>
                <div class="text-sm leading-relaxed text-[var(--c-text-muted)]" innerHTML={message} />
            </div>
            <Show when={children?.length}>
                <div class="mt-4 border-l border-[var(--c-border)] pl-4">
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
