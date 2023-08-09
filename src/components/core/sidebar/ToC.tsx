import { Show, createEffect, createSignal, onMount } from "solid-js";
import { trackEvent } from "~/utils/track";
import { set } from "../header/ThemeSwitch/Provider";
import Seprator from "./Seprator";

const ToC = ({ toc, slug }) => {
    const [visible, setVisible] = createSignal(false);
    if (!toc) return <></>
    createEffect(() => {
        set({ modal: visible() })
    })
    const [readingProgress, setReadingProgress] = createSignal(0);
    const scrollListerner = (initOffset, sectionTarget) => {
        const windowScrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
        const scrollHeight = windowScrollTop - initOffset
        const normalizedHeight = Math.min(Math.max(0, scrollHeight), sectionTarget.offsetHeight)
        setReadingProgress(Math.floor(normalizedHeight / sectionTarget.offsetHeight * 100))
    }
    onMount(() => {
        const sectionTarget = document.getElementById('blog-article')
        const offset = sectionTarget.offsetTop - Math.floor(window.innerHeight / 1.6)
        window.addEventListener("scroll", () => scrollListerner(offset, sectionTarget))
    })
    return (
        <>
            <aside class=":: lg:max-w-80 lg:ml-6 xl:ml-8 <lg:fixed z-10 ">
                <div class=":: lg:top-10 md:sticky ">
                    <button title="ToC" onClick={(e) => { setVisible(true) }} class=":: fixed lg:hidden bottom-28 right-10 z-10 rounded shadow-round bg-[var(--ers-bg)] ">
                        <i class=":: i-carbon-catalog w-8 h-8 m-2 text-[var(--meta-bg)] "></i>
                    </button>
                    <Show when={visible()}>
                        <div onClick={() => { setVisible(false) }} class="fixed w-screen top-0 h-screen left-0 bg-[var(--meta-bg)] z-20" />
                    </Show>
                    <div id="toc" class={`:: duration-200 z-20 overflow-y-auto transition-max-height toc-responsive ${visible() ? '<lg:max-h-104' : '<lg:max-h-0'} `}>
                        <div class="h-4"></div>
                        <div class="flex font-headline "><Seprator title={`目录 `} /> <span class="mt-1px">（{readingProgress()}%）</span></div>
                        <div onClick={() => { setVisible(false); trackEvent("Click TableofContents", { props: { slug: slug } }) }} class=":: mt-2 mb-4 flex-wrap flex overflow-y-auto max-h-40vh " innerHTML={toc} />
                    </div>
                </div>
            </aside >
        </>
    )
}

export default ToC;