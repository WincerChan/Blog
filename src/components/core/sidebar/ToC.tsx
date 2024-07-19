import { Accessor, createSignal, onMount } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import IconCatalog from "~icons/carbon/catalog";
import { globalStore } from "../header/ThemeSwitch/Provider";
import Modal from "../section/Modal";

interface ToCInterface {
    toc: string;
    slug: string,
    LL: Accessor<Translations>;
}
const ToC = ({ toc, slug, LL }: ToCInterface) => {
    const [visible, setVisible] = createSignal(false);
    if (toc === '<nav id="TableOfContents"></nav>') return <></>
    if (!toc) return <></>
    const [readingProgress, setReadingProgress] = createSignal(0);
    const scrollListerner = (initOffset, sectionTarget) => {
        const windowScrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
        const scrollHeight = windowScrollTop - initOffset
        const normalizedHeight = Math.min(Math.max(0, scrollHeight), sectionTarget.offsetHeight)
        setReadingProgress(Math.floor(normalizedHeight / sectionTarget.offsetHeight * 100))
    }
    onMount(() => {
        const sectionTarget = document.getElementById('blog-article')
        if (!sectionTarget) return
        const offset = sectionTarget.offsetTop - Math.floor(window.innerHeight / 1.6)
        window.addEventListener("scroll", () => scrollListerner(offset, sectionTarget))
    })
    return (
        <>
            <aside class=":: lg:max-w-80 lg:ml-8 <lg:fixed <lg:z-10 ">
                <div class=":: lg:top-10 md:sticky ">
                    <button title="ToC" onClick={(e) => { setVisible(true) }} class=":: fixed lg:hidden bottom-28 right-10 z-10 rounded shadow-round text-[var(--meta-bg)] bg-[var(--ers-bg)] ">
                        <IconCatalog width={32} height={32} class="m-2" />
                    </button>
                    <Modal toggle={visible} setToggle={setVisible}>
                    </Modal>
                    <div id="toc" class={`:: duration-200 z-20 overflow-y-auto transition-max-height toc-modal ${visible() ? '<lg:max-h-42vh' : '<lg:max-h-0'} `}>
                        <div class=":: h-4 "></div>
                        <div class=":: flex font-headline "><label>{LL && LL().sidebar.TOC()}</label> <span class=":: mt-1px ">（{readingProgress()}%）</span></div>
                        <div onClick={() => { setVisible(false); globalStore.trackEvent("Click TableofContents", { props: { slug: slug } }) }} class=":: mt-2 mb-4 flex-wrap flex overflow-y-auto max-h-41vh " innerHTML={toc} />
                    </div>
                </div>
            </aside >
        </>
    )
}

export default ToC;