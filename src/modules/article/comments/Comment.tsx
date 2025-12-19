import { Accessor, ErrorBoundary, Show, Suspense, createEffect, createResource, createSignal } from "solid-js";
import CommentList from "~/modules/article/comments/OldComment";
import { Translations } from "~/i18n/i18n-types";
import { fetcher } from "~/utils";
import { globalStore } from "~/features/theme";

interface GiscusCommentProps {
    pageURL: string
    LL: Accessor<Translations>
}

export default function GiscusComment({ pageURL, LL }: GiscusCommentProps) {
    const [visible, setVisible] = createSignal(false)
    const [url, setUrl] = createSignal()
    const [resource] = createResource(url, fetcher)
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
        const pathEncoded = btoa(pageURL).replace("+", "-").replace("/", "_")
        if (visible()) { import('giscus'); setUrl(`${__SITE_CONF.extURL}/api/comments/${pathEncoded}`) }
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
        </div>
    )
} 
