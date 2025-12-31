import { Accessor, For, createSignal, onMount, Show } from "solid-js";
import { Properties } from "solid-js/web";
import IconPointFilled from "~icons/ph/dot-outline-fill";
import IconShieldCheck from "~icons/ph/shield-check";
import IconReply from "~icons/ph/arrow-bend-up-left";
import IconGithub from "~icons/ph/github-logo";

interface CommentProps {
    author: string,
    date: string,
    message: string,
    id: string,
    avatarUrl?: string,
    url?: string,
    source?: string,
    children?: CommentProps[]
    isChild?: boolean
}

type ReplyState = {
    activeId: Accessor<string | null>;
    setActiveId: (id: string | null) => void;
};

const Comment = ({
    author,
    date,
    message,
    children,
    id,
    avatarUrl,
    url,
    source,
    isChild,
    replyState,
}: CommentProps & { replyState: ReplyState }) => {
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
    const isActive = () => replyState.activeId() === id;
    const handleReplyClick = () => {
        replyState.setActiveId(isActive() ? null : id);
    };
    const shouldShowReply = () => source !== "legacy";
    onMount(() => {
        if (!self) return;
        // add all a tag with target="_blank", rel="noopener noreferrer"
        const aTags = self.querySelectorAll("a")
        aTags.forEach(a => {
            a.target = "_blank"
            a.classList.add(
                "text-[var(--c-link)]",
                "underline",
                "decoration-[var(--c-border-strong)]",
                "underline-offset-4",
                "hover:text-[var(--c-link-hover)]",
                "hover:decoration-[var(--c-link)]",
            )
            a.rel = "noopener noreferrer"
        })
    })
    return (
        <>
            <div ref={self!} class="flex flex-col gap-2"
                classList={{ "mt-6": !isChild }}>
                <div class="flex items-center gap-3">
                    <div class="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-xs font-medium text-[var(--c-text)] flex items-center justify-center">
                        <Show when={avatarUrl} fallback={initial(author)}>
                            <img
                                src={avatarUrl}
                                alt={author}
                                class="h-full w-full object-cover"
                                loading="lazy"
                                referrerpolicy="no-referrer"
                            />
                        </Show>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2 text-sm text-[var(--c-text-subtle)]">
                            <span class="text-[var(--c-text)] font-sans font-semibold text-sm">{author}</span>
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
                <Show when={shouldShowReply()}>
                    <div class="flex items-center gap-2 text-xs text-[var(--c-text-subtle)]">
                        <Show
                            when={url && isActive()}
                            fallback={
                                <button
                                    type="button"
                                    onClick={handleReplyClick}
                                    class="inline-flex items-center gap-1 transition-colors hover:text-[var(--c-text)]"
                                >
                                    <IconReply class="h-4 w-4 mr-1" />
                                    Reply
                                </button>
                            }
                        >
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                class="inline-flex items-center gap-1 transition-colors hover:text-[var(--c-text)] hover:underline hover:decoration-1 hover:underline-offset-4"
                            >
                                <IconGithub class="h-4 w-4 mr-1" />
                                Reply On Github
                            </a>
                        </Show>
                    </div>
                </Show>
            </div>
            <Show when={children?.length}>
                <div class="mt-4 border-l border-[var(--c-border)] pl-4">
                    <CommentThread comments={children!} isChild={true} replyState={replyState} />
                </div>
            </Show>
        </>
    )
}



const CommentThread = (props: {
    comments: CommentProps[];
    isChild?: boolean;
    replyState?: ReplyState;
}) => {
    const [activeId, setActiveId] = createSignal<string | null>(null);
    const replyState = props.replyState ?? { activeId, setActiveId };
    return (
        <div>
            <For each={props.comments}>
                {comment => (
                    <Comment {...comment} isChild={props.isChild} replyState={replyState} />
                )}
            </For>
        </div>
    )
}

export { Comment };

export default CommentThread
