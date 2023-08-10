import siteConf from "@/hugo.json";
import { Accessor, Show, createEffect, createSignal } from "solid-js";
import { isBrowser } from "~/utils";
import { trackEvent } from "~/utils/track";

const disqusShort = "wincer"

const DisqusButton = ({ nowLoad, shouldLoad, slug }: { nowLoad: Accessor<unknown>, shouldLoad: (arg0: boolean) => void, slug: string }) => {
    const [showButton, setShowButton] = createSignal(true)
    const [errorMsg, setErrorMsg] = createSignal('')
    const [loadingState, setLoadingState] = createSignal(false)
    const load = () => {
        if (!isBrowser) return
        // 之前在其他的页面已经成功加载过 DISUQS，直接返回
        if (typeof DISQUS !== "undefined") { shouldLoad(true); setShowButton(false); return }
        setLoadingState(true)
        const d = document, s = d.createElement('script');
        s.src = `https://${disqusShort}.disqus.com/embed.js`;
        s.onerror = () => {
            setErrorMsg("看起来 Disqus 无法加载，可能是因为你的网络环境不太好。")
            setShowButton(true)
        }
        s.onload = () => {
            setErrorMsg("")
            setLoadingState(false)
            setShowButton(false)
            trackEvent("Disqus", { props: { slug: slug } })
        }
        s.setAttribute('data-timestamp', `${+new Date()}`);
        (d.head || d.body).appendChild(s);
    }

    createEffect(() => {
        nowLoad() && load()
    })

    return (
        <>
            <div id="disqus_thread" class={`w-full ${!showButton() ? 'min-h-64' : ''}`}></div>
            <Show when={errorMsg()}>
                <p class="mb-4"><b>{errorMsg()}</b></p>
            </Show>
            <Show when={loadingState()}>
                <p>正在尝试加载 Disqus，请稍等</p>
            </Show>
            <Show when={!loadingState() && showButton()}>
                <button onClick={load} title="点击加载评论" class=":: p-3 font-headline w-full leading-8 rounded card-outline ">点击以加载 Disqus 评论</button>
            </Show>
        </>
    )
}




const DisqusComment = ({ slug }: { slug: string }) => {
    const [visible, setVisible] = createSignal()
    let self: HTMLDivElement, favicon: HTMLImageElement
    createEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                window.disqus_config = function () {
                    this.page.url = `${pageCanonical}`;
                    this.page.identifier = `${pageCanonical}`;
                }
                const img = new Image();
                img.src = 'https://disqus.com/favicon.ico?' + new Date().getTime(); // 添加时间戳防止缓存
                img.onload = function () {
                    visible() ?? setVisible(true)
                };
                setTimeout(() => { visible() ?? (setVisible(false), console.log("100ms 内无法连接到 disqus。")) }, 100)
                observer.unobserve(entries[0].target)
            }
        })
        observer.observe(self as HTMLDivElement)
    })
    createEffect(() => {
        if (!visible()) return
        if (typeof DISQUS !== "undefined") DISQUS.reset({
            reload: true, config: function () {
                this.page.url = pageCanonical;
                this.page.identifier = pageCanonical;
            }
        })
    })
    const pageCanonical = new URL(slug, siteConf.baseURL)
    return (
        <div class=":: mt-8 <md:mx-4 " ref={self!}>
            <DisqusButton nowLoad={visible} shouldLoad={setVisible} slug={slug} />
        </div>
    )

}

export default DisqusComment