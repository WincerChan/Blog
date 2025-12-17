import { useLocation } from "@solidjs/router";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconCatalog from "~icons/carbon/catalog";
import Modal from "../section/Modal";

interface ToCInterface {
    toc: string;
    slug: string,
}
const ToC = ({ toc, slug }: ToCInterface) => {
    if (toc === '<nav id="TableOfContents"></nav>') return <></>
    if (!toc) return <></>

    let ref: HTMLDivElement;
    const { LL } = useI18nContext()
    const [visible, setVisible] = createSignal(false);

    const loc = useLocation()
    const hash = createMemo(() => loc.hash)

    const decodeFragment = (fragment: string) => {
        try {
            return decodeURIComponent(fragment);
        } catch {
            return fragment;
        }
    };

    const [isScrolling, setIsScrolling] = createSignal(false)
    const [activeId, setActiveId] = createSignal('');
    const [hrefs, setHrefs] = createSignal<HTMLAnchorElement[]>([])
    let scrollTargetTop: number | null = null;
    let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;

    const stopScrolling = () => {
        if (scrollEndTimer) clearTimeout(scrollEndTimer);
        scrollEndTimer = undefined;
        scrollTargetTop = null;
        setIsScrolling(false);
    };

    const getScrollTop = () =>
        (document.scrollingElement ?? document.documentElement).scrollTop ?? 0;

    const handleScroll = () => {
        const currScrollTop = getScrollTop();
        if (currScrollTop < 64 && !isScrolling()) {
            setActiveId("");
            return;
        }

        if (!isScrolling()) return;

        if (scrollTargetTop !== null && Math.abs(currScrollTop - scrollTargetTop) <= 2) {
            stopScrolling();
            return;
        }

        if (scrollEndTimer) clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => {
            stopScrolling();
        }, 140);
    };

    createEffect(() => {
        if (!hash()) return

        const id = decodeFragment(hash().slice(1))
        if (!id) return
        setActiveId(id)
    })

    const handleIntersect = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isScrolling()) {
                setActiveId(entry.target.id);
            }
        });
    }


    // add event listener for toc
    createEffect(() => {
        const anchors = hrefs();
        if (!anchors.length) return;

        const observer = new IntersectionObserver(handleIntersect, {
            root: null,
            rootMargin: '0px 0px -95% 0px',
            threshold: 0.1,
        })

        const cleanup: Array<() => void> = [];
        anchors.forEach((elem) => {
            const id = decodeFragment(elem.href.split("#")[1] ?? "");
            if (!id) return;

            const onClick = () => handleClick(id);
            elem.addEventListener("click", onClick);
            cleanup.push(() => elem.removeEventListener("click", onClick));

            const heading = document.getElementById(id);
            heading && observer.observe(heading);
        });

        onCleanup(() => {
            observer.disconnect();
            cleanup.forEach((fn) => fn());
        });
    })

    createEffect(() => {
        const anchors = hrefs()
        if (activeId() == '') {
            ref.scrollTop = 0
        }
        anchors.forEach(anchor => {
            const hrefLink = decodeFragment(anchor.href.split("#")[1] ?? "");
            if (!hrefLink) return;
            if (hrefLink == activeId()) {
                anchor.classList.add('active')
                ref.scrollTo({ top: anchor.offsetTop - 54 })
            }
            else
                anchor.classList.remove('active')
        })

    })

    onMount(() => {
        window.addEventListener('scroll', handleScroll)
        onCleanup(() => window.removeEventListener("scroll", handleScroll));
        setHrefs(Array.from(ref.querySelectorAll('a')))
    })


    const handleClick = (id: string) => {
        if (!id) return
        const heading = document.getElementById(id)
        if (!heading) return
        scrollTargetTop = heading.offsetTop;
        if (Math.abs(getScrollTop() - scrollTargetTop) <= 2) return;
        setIsScrolling(true);
        setActiveId(id);
    }


    const ClickToC = () => {
        setVisible(false);
    }
    return (
        <>
            <aside class=":: lg:max-w-80 lg:ml-6 <lg:fixed <lg:z-10 lg:order-last ">
                <div class=":: lg:top-10 md:sticky ">
                    <button title="ToC" onClick={(e) => { setVisible(true) }} class=":: fixed lg:hidden bottom-28 right-10 z-10 rounded shadow-round text-[var(--meta-bg)] bg-[var(--ers-bg)] ">
                        <IconCatalog width={32} height={32} class="m-2" />
                    </button>
                    <Modal toggle={visible} setToggle={setVisible}>
                    </Modal>
                    <div id="toc" class={`:: duration-200 z-20 overflow-y-auto transition-max-height toc-modal ${visible() ? '<lg:max-h-42vh' : '<lg:max-h-0'} `}>
                        <div class=":: h-4 "></div>
                        <div class=":: ml-2 flex font-headline "><label>{LL().sidebar.TOC()}</label> </div>
                        <div ref={ref!} onClick={ClickToC} class=":: mt-2 mb-4 flex-wrap flex overflow-y-auto max-h-44vh " innerHTML={toc} />
                    </div>
                </div>
            </aside >
        </>
    )
}

export default ToC;
