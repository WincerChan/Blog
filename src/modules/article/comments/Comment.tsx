import { Accessor, ErrorBoundary, Show, Suspense, createEffect, createMemo, createResource, createSignal } from "solid-js";
import CommentList from "~/modules/article/comments/OldComment";
import { Translations } from "~/i18n/i18n-types";
import { globalStore } from "~/features/theme";
import { safeEncode } from "~/content/velite-utils";

interface GiscusCommentProps {
    pageURL: string
    LL: Accessor<Translations>
    hasLegacyComments?: boolean
}

export default function GiscusComment({ pageURL, LL, hasLegacyComments }: GiscusCommentProps) {
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
        return pathname;
    };
    const legacyPath = createMemo(() => normalizePath(pageURL));
    const legacyUrl = createMemo(() => {
        const path = legacyPath();
        const parts = path.split("/").filter(Boolean);
        if (parts.length === 0) return "";
        const encoded = parts.map((part) => safeEncode(part)).join("/");
        return `/_data/legacy-comments/${encoded}.json`;
    });
    const fetchLegacyComments = async (target: string | null) => {
        if (!target) return [];
        try {
            const resp = await fetch(target);
            if (!resp.ok) return [];
            return await resp.json();
        } catch {
            return [];
        }
    };
    const hasLegacy = createMemo(() => hasLegacyComments === true);
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
        if (!visible()) return;
        import('giscus');
    })
    createEffect(() => {
        if (!visible()) {
            setUrl(null);
            return;
        }
        setUrl(hasLegacy() ? legacyUrl() : null);
    })

    return (
        <div ref={self!} id="gisdus" class=":: w-full mt-6 ">
            <Show when={visible()}>
                <giscus-widget
                    id="comments"
                    repo="WincerChan/blog-comments"
                    repoId="R_kgDOKKgBSg"
                    category="Announcements"
                    categoryId="DIC_kwDOKKgBSs4CYzae"
                    mapping="pathname"
                    term="Welcome to Wincer's Blog!"
                    strict="0"
                    emitMetadata="0"
                    reactionsEnabled="0"
                    inputPosition="top"
                    theme={`noborder_${globalStore.theme}`}
                    lang={LL && LL().post.S()}
                    loading="lazy"
                />
                <Show when={hasLegacy()}>
                    <Suspense fallback={<span class=":: text-lg font-headline ">{LL && LL().post.DIS()}</span>}>
                        <ErrorBoundary fallback={<span></span>}>
                            <Show when={resource()}>
                                {Object.keys(resource()).length && <p class=":: my-6 text-lg font-headline ">
                                    以下是旧时在 Disqus 上的评论，仅作展示用。
                                </p>}
                                <CommentList comments={resource()} />
                            </Show>
                        </ErrorBoundary>
                    </Suspense>
                </Show>
            </Show>
        </div>
    )
} 
