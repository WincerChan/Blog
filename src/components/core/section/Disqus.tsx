import siteConf from "@/hugo.json";
import { Accessor, Show, createEffect, createSignal } from "solid-js";
import { isBrowser } from "~/utils";

const disqusShort = "wincer"

const DisqusButton = ({ nowLoad, setLoad }: { nowLoad: Accessor<unknown>, setLoad: (arg0: boolean) => void }) => {
    const [visibility, setVisibility] = createSignal(true)
    const [errorMsg, setErrorMsg] = createSignal('')
    const [loading, setLoading] = createSignal(false)
    const load = () => {
        if (!isBrowser) return
        if (typeof DISQUS !== "undefined") { setLoad(true); return }
        setLoading(true)
        const d = document, s = d.createElement('script');
        s.src = `https://${disqusShort}.disqus.com/embed.js`;
        s.onerror = () => {
            setErrorMsg("看起来 Disqus 无法加载，可能是因为你的网络环境不太好。")
            setVisibility(true)
        }
        s.onload = () => {
            setErrorMsg("")
            setLoading(false)
            setVisibility(false)
        }
        s.setAttribute('data-timestamp', `${+new Date()}`);
        (d.head || d.body).appendChild(s);
    }

    createEffect(() => {
        nowLoad() && load()
    })

    return (
        <>
            <div id="disqus_thread" class={`w-full ${!visibility() ? 'min-h-64' : ''}`}></div>
            <Show when={errorMsg()}>
                <p class="mb-4"><b>{errorMsg()}</b></p>
            </Show>
            <Show when={loading()}>
                <p>正在尝试加载 Disqus，请稍等</p>
            </Show>
            <Show when={!loading() && visibility()}>
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
                const img = new Image();
                img.src = 'https://disqus.com/favicon.ico?' + new Date().getTime(); // 添加时间戳防止缓存
                img.onload = function () {
                    visible() ?? setVisible(true)
                };
                setTimeout(() => { setVisible(false); console.log("100ms 内无法连接到 disqus。") }, 100)
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
        });
    })
    const pageCanonical = new URL(slug, siteConf.baseURL)
    return (
        <div class=":: mt-8 <md:mx-4 <md:mb-8 " ref={self!}>
            <script id="disqus_config" innerHTML={`
                var disqus_config = function () {
                    this.page.url = "${pageCanonical}" ;
                    this.page.identifier = "${pageCanonical}";
                };
            `
            } />
            <DisqusButton nowLoad={visible} setLoad={setVisible} />
        </div>
    )

}

export default DisqusComment