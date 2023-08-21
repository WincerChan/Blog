import siteConf from "@/hugo.json";
import { Show, Suspense, createEffect, createSignal, lazy } from "solid-js";
import { useLocation } from "solid-start";


const DisqusComment = () => {
    const path = useLocation().pathname
    const slug = path.startsWith("/posts/") ? path : path.slice(1, -1)
    const [visible, setVisible] = createSignal()
    const [connectible, setConnectible] = createSignal()
    const Disqus = lazy(() => import("../../lazy/Disqus"))
    let self: HTMLDivElement, favicon: HTMLImageElement
    createEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setVisible(true)
                window.disqus_config = function () {
                    this.page.url = `${pageCanonical}`;
                    this.page.identifier = `${pageCanonical}`;
                }
                const img = new Image();
                img.src = 'https://disqus.com/favicon.ico?' + new Date().getTime(); // 添加时间戳防止缓存
                img.onload = function () {
                    connectible() ?? setConnectible(true)
                };
                setTimeout(() => { console.log("自动加载 disqus"); connectible() ?? (setConnectible(false), console.log("500ms 内无法连接到 disqus。")) }, 500)
                observer.unobserve(entries[0].target)
            }
        })
        observer.observe(self as HTMLDivElement)
    })
    createEffect(() => {
        if (!connectible()) return
        if (typeof DISQUS !== "undefined") DISQUS.reset({
            reload: true, config: function () {
                this.page.url = pageCanonical;
                this.page.identifier = pageCanonical;
            }
        })
    })
    const pageCanonical = new URL(slug, siteConf.baseURL)
    return (
        <div class=":: mt-8 " ref={self!}>
            <Show when={visible()}>
                <Suspense>
                    <Disqus nowLoad={connectible} shouldLoad={setConnectible} slug={slug} />
                </Suspense>
            </Show>
        </div>
    )

}

export default DisqusComment