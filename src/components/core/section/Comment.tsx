import { Show, Suspense, createEffect, createResource, createSignal } from "solid-js";
import CommentList from "~/components/lazy/OldComment/Comment";
import { fetcher } from "~/utils";
import { val } from "../header/ThemeSwitch/Provider";



export default function GiscusComment({ pageURL }) {
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
        if (visible()) { import('giscus'); setUrl(`https://blog-exts.itswincer.com/api/comments/${pathEncoded}`) }
    })

    return (
        <div ref={self!} id="gisdus" class="w-full mt-6">
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
                    theme={`noborder_${val.theme}`}
                    lang="zh-CN"
                    loading="lazy"
                />
                <Suspense fallback={<span>正在加载 Disqus 评论</span>}>
                    <Show when={resource()} fallback={<span class=":: text-lg font-headline ">正在加载 Disqus 评论</span>}>
                        {Object.keys(resource()).length && <p class=":: my-6 text-lg ">
                            以下是旧时在 Disqus 上的评论，仅作展示用。
                        </p>}
                        <CommentList comments={resource()} />
                    </Show>
                </Suspense>
            </Show>
        </div>
    )
} 