import { Accessor, ErrorBoundary, Show, createEffect, createMemo, createResource, createSignal } from "solid-js";
import CommentThread from "./CommentThread";
import { Translations } from "~/i18n/i18n-types";
import { inkstoneApi } from "~/utils/inkstone";
import IconArrowUpRight from "~icons/ph/arrow-up-right";

interface CommentsProps {
    pageURL: string
    LL: Accessor<Translations>
}

type CommentItem = {
    id: string;
    author: string;
    date: string;
    message: string;
    url?: string;
    avatarUrl?: string;
    source?: string;
    children?: CommentItem[];
};

type CommentPayload = {
    total: number;
    discussionUrl: string | null;
    comments: CommentItem[];
};

const CommentSkeleton = () => (
    <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3">
                <div class="h-6 w-6 rounded-full bg-[var(--c-border)] opacity-60" />
                <div class="flex-1">
                    <div class="h-4 w-32 rounded bg-[var(--c-border)] opacity-60" />
                </div>
            </div>
            <div class="h-4 w-5/6 rounded bg-[var(--c-border)] opacity-60" />
            <div class="h-4 w-3/5 rounded bg-[var(--c-border)] opacity-60" />
            <div class="h-3 w-20 rounded bg-[var(--c-border)] opacity-60" />
        </div>
        <div class="border-l border-[var(--c-border)] pl-4">
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-3">
                    <div class="h-6 w-6 rounded-full bg-[var(--c-border)] opacity-60" />
                    <div class="flex-1">
                        <div class="h-4 w-28 rounded bg-[var(--c-border)] opacity-60" />
                    </div>
                </div>
                <div class="h-4 w-4/6 rounded bg-[var(--c-border)] opacity-60" />
                <div class="h-3 w-16 rounded bg-[var(--c-border)] opacity-60" />
            </div>
        </div>
    </div>
);

export default function Comments({ pageURL, LL }: CommentsProps) {
    const [visible, setVisible] = createSignal(false)
    const [url, setUrl] = createSignal<string | null>(null)
    const normalizePath = (input: string) => {
        let pathname = String(input || "");
        if (/^https?:\/\//.test(pathname)) {
            try {
                pathname = new URL(pathname).pathname;
            } catch {
                // keep raw path
            }
        }
        pathname = pathname.split("?")[0].split("#")[0];
        if (!pathname.startsWith("/")) pathname = `/${pathname}`;
        if (!pathname.endsWith("/")) pathname = `${pathname}/`;
        return pathname.toLowerCase();
    };
    const targetPath = createMemo(() => normalizePath(pageURL));
    const fetchLegacyComments = async (target: string | null): Promise<CommentPayload> => {
        if (!target) return { total: 0, discussionUrl: null, comments: [] };
        try {
            const url = new URL(inkstoneApi("comments"));
            url.searchParams.set("post_id", target);
            const resp = await fetch(url);
            if (!resp.ok) return { total: 0, discussionUrl: null, comments: [] };
            const data = await resp.json();
            const comments = Array.isArray(data?.comments) ? data.comments : [];
            const toComment = (item: any): CommentItem => ({
                id: String(item?.id ?? ""),
                author: String(item?.author_login ?? ""),
                date: String(item?.created_at ?? item?.updated_at ?? ""),
                message: String(item?.body_html ?? ""),
                url: item?.url ? String(item.url) : undefined,
                avatarUrl: item?.author_avatar_url ? String(item.author_avatar_url) : undefined,
                source: item?.source ? String(item.source) : undefined,
                children: Array.isArray(item?.replies) ? item.replies.map(toComment) : [],
            });
            return {
                total: Number.isFinite(data?.total) ? data.total : comments.length,
                discussionUrl: data?.discussion_url ? String(data.discussion_url) : null,
                comments: comments.map(toComment),
            };
        } catch {
            return { total: 0, discussionUrl: null, comments: [] };
        }
    };
    const [resource] = createResource(url, fetchLegacyComments)
    let self;
    createEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setVisible(true)
                observer.unobserve(entries[0].target)
            }
        })
        observer.observe(self as HTMLDivElement)
    })

    createEffect(() => {
        if (!visible()) {
            setUrl(null);
            return;
        }
        setUrl(targetPath());
    })

    return (
        <div ref={self!} id="comments" class="pt-8">
            <Show when={visible()}>
                <div class="flex items-center justify-between mb-8">
                    <h3 class="text-xl md:text-2xl font-medium">评论</h3>
                    <Show when={!resource.loading && resource()}>
                        {(payload) => (
                            <Show
                                when={payload().discussionUrl}
                                fallback={
                                    <span class="text-sm text-[var(--c-text-subtle)]">
                                        共 {payload().total} 条评论
                                    </span>
                                }
                            >
                                <a
                                    href={payload().discussionUrl!}
                                    target="_blank"
                                    rel="noreferrer"
                                    class="group inline-flex items-center gap-1 text-sm text-[var(--c-text-muted)] underline decoration-1 underline-offset-4 decoration-[var(--c-border-strong)] transition-colors hover:text-[var(--c-text)] hover:decoration-[var(--c-text)]"
                                >
                                    共 {payload().total} 条评论
                                    <IconArrowUpRight class="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--c-link)]" />
                                </a>
                            </Show>
                        )}
                    </Show>
                </div>
                <ErrorBoundary fallback={<span></span>}>
                    <Show when={resource.loading}>
                        <CommentSkeleton />
                    </Show>
                    <Show when={!resource.loading && (resource()?.comments ?? []).length > 0}>
                        <CommentThread comments={resource()?.comments ?? []} />
                    </Show>
                </ErrorBoundary>
            </Show>
        </div>
    )
} 
