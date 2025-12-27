import { useLocation } from "@solidjs/router";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconList from "~icons/tabler/list";
import Modal from "../components/Modal";

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
            <aside class="">
                <div class="">
                    <button title="ToC" onClick={(e) => { setVisible(true) }} class="">
                        <IconList width={32} height={32} class="" />
                    </button>
                    <Modal toggle={visible} setToggle={setVisible}>
                    </Modal>
                    <div id="toc" class="">
                        <div class=""></div>
                        <div class=""><label>{LL().sidebar.TOC()}</label> </div>
                        <div ref={ref!} onClick={ClickToC} class="" innerHTML={toc} />
                    </div>
                </div>
            </aside >
        </>
    )
}

export default ToC;
