import { useLocation } from "@solidjs/router";
import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconCatalog from "~icons/carbon/catalog";
import { globalStore } from "../header/ThemeSwitch/Provider";
import Modal from "../section/Modal";

interface ToCInterface {
    toc: string;
    slug: string,
}
const ToC = ({ toc, slug }: ToCInterface) => {
    let ref: HTMLDivElement;
    const { LL } = useI18nContext()
    const [visible, setVisible] = createSignal(false);
    const [scrolling, setScrolling] = createSignal(false)
    const [tocIndex, setTocIndex] = createSignal(-1)
    const [hIndex, setHIndex] = createSignal(-1)
    createEffect(() => {
        if (tocIndex() == -1) return
        const link = ref.getElementsByTagName('a')[tocIndex()]
        ref.scrollTop = link.offsetTop - 57 - 36
    })
    createEffect(() => {
        if (scrolling()) return
        if (hIndex() == -1) return
        const link = ref.getElementsByTagName('a')[hIndex()]
        ref.scrollTop = link.offsetTop - 57 - 36
    })

    if (toc === '<nav id="TableOfContents"></nav>') return <></>
    if (!toc) return <></>
    const loc = useLocation()
    const hash = createMemo(() => loc.hash)
    createEffect(() => {
        if (!hash()) return
        const elems = ref.getElementsByTagName('a')
        Array.from(elems).forEach((element, i) => {
            element.onclick = () => {
                setTocIndex(i)
                setScrolling(true)
                setTimeout(() => setScrolling(false), 500)
            }
            if (element.href.endsWith(hash())) {
                element.classList.add('active')
            } else {
                element.classList.remove('active')
            }
        });
    })
    onMount(() => {
        const sections = document.querySelectorAll("#blog-article h2, h3, h4");
        const tocLinks = document.querySelectorAll("#TableOfContents a");
        const options = {
            root: null,
            rootMargin: "0px 0px -90% 0px",
            threshold: 0 // 50%的可见度
        };
        document.addEventListener("scroll", () => {
            if (hIndex() == -1) return
            if (document.documentElement.scrollTop === sections[hIndex()].offsetTop) {
                console.log("scroll right")
                setTimeout(() => { setScrolling(false) }, 100)
            }
        })
        const callback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tocLinks.forEach((link, i) => {
                        link.classList.remove("active");
                        if (link.getAttribute("href").substring(1) === entry.target.id) {
                            setHIndex(i)
                            link.classList.add("active");
                        }
                    });
                }
            });
        };

        const observer = new IntersectionObserver(callback, options);

        sections.forEach(section => {
            observer.observe(section);
        });
    })

    const ClickToC = (event) => {
        setVisible(false);
        globalStore.trackEvent("Click TableofContents", { props: { slug: slug } })
    }
    return (
        <>
            <aside class=":: lg:max-w-80 lg:ml-6 <lg:fixed <lg:z-10 ">
                <div class=":: lg:top-10 md:sticky ">
                    <button title="ToC" onClick={(e) => { setVisible(true) }} class=":: fixed lg:hidden bottom-28 right-10 z-10 rounded shadow-round text-[var(--meta-bg)] bg-[var(--ers-bg)] ">
                        <IconCatalog width={32} height={32} class="m-2" />
                    </button>
                    <Modal toggle={visible} setToggle={setVisible}>
                    </Modal>
                    <div id="toc" class={`:: duration-200 z-20 overflow-y-auto transition-max-height toc-modal ${visible() ? '<lg:max-h-42vh' : '<lg:max-h-0'} `}>
                        <div class=":: h-4 "></div>
                        <div class=":: ml-2 flex font-headline "><label>{LL().sidebar.TOC()}</label> </div>
                        <div ref={ref} onClick={ClickToC} class=":: mt-2 mb-4 flex-wrap flex overflow-y-auto max-h-42vh scroll-smooth " innerHTML={toc} />
                    </div>
                </div>
            </aside >
        </>
    )
}

export default ToC;