import { useLocation } from "@solidjs/router";
import { Show, createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconList from "~icons/tabler/list";

interface ToCInterface {
    toc: string;
    slug: string,
}
const ToC = ({ toc, slug }: ToCInterface) => {
    if (toc === '<nav id="TableOfContents"></nav>') return <></>
    if (!toc) return <></>

    let desktopRef: HTMLDivElement;
    let mobileRef: HTMLDivElement;
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

    const baseAnchorClasses = [
        "block",
        "text-sm",
        "leading-relaxed",
        "text-[var(--c-text-muted)]",
        "transition-colors",
        "hover:text-[var(--c-text)]",
    ];
    const activeAnchorClasses = ["text-[var(--c-text)]", "font-medium"];

    const applyBaseClasses = (anchor: HTMLAnchorElement) => {
        anchor.classList.add(...baseAnchorClasses);
    };

    const styleList = (container?: HTMLDivElement) => {
        if (!container) return [] as HTMLAnchorElement[];
        container.classList.add("space-y-1");
        container.querySelectorAll("ul").forEach((list) => {
            list.classList.add("space-y-1");
            if (list.parentElement?.tagName === "LI") {
                list.classList.add("pl-3", "border-l", "border-[var(--c-border)]");
            }
        });
        container.querySelectorAll("li").forEach((item) => {
            item.classList.add("leading-relaxed");
        });
        const anchors = Array.from(container.querySelectorAll("a"));
        anchors.forEach((anchor) => applyBaseClasses(anchor));
        return anchors;
    };

    const syncAnchors = () => {
        const anchors = [
            ...styleList(desktopRef),
            ...styleList(mobileRef),
        ];
        setHrefs(anchors);
    };

    const getActiveContainer = () => {
        if (visible() && mobileRef) return mobileRef;
        if (desktopRef) return desktopRef;
        return mobileRef;
    };

    createEffect(() => {
        const anchors = hrefs();
        const container = getActiveContainer();
        if (!container) return;
        if (activeId() === "") {
            container.scrollTop = 0;
        }
        anchors.forEach((anchor) => {
            const hrefLink = decodeFragment(anchor.href.split("#")[1] ?? "");
            if (!hrefLink) return;
            const isActive = hrefLink === activeId();
            activeAnchorClasses.forEach((cls) => {
                anchor.classList.toggle(cls, isActive);
            });
        });
        if (activeId() === "") return;
        const activeAnchor = Array.from(container.querySelectorAll("a")).find((anchor) => {
            const hrefLink = decodeFragment(anchor.href.split("#")[1] ?? "");
            return hrefLink === activeId();
        });
        if (activeAnchor) {
            container.scrollTo({ top: activeAnchor.offsetTop - 48 });
        }
    });

    onMount(() => {
        window.addEventListener('scroll', handleScroll)
        onCleanup(() => window.removeEventListener("scroll", handleScroll));
        syncAnchors();
    })

    createEffect(() => {
        if (!visible()) {
            document.body.style.overflow = "";
            return;
        }
        document.body.style.overflow = "hidden";
        queueMicrotask(syncAnchors);
    });


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
        if (visible()) setVisible(false);
    }
    return (
        <div class="md:col-start-3 md:row-start-1 md:justify-self-start">
            <aside class="hidden md:block md:sticky md:top-24">
                <div class="text-xs uppercase tracking-wide text-[var(--c-text-subtle)]">
                    <span>{LL().sidebar.TOC()}</span>
                </div>
                <div
                    id="toc"
                    ref={desktopRef!}
                    onClick={ClickToC}
                    class="mt-3 max-h-[calc(100vh-12rem)] overflow-auto pr-2"
                    innerHTML={toc}
                />
            </aside>
            <button
                title="ToC"
                aria-label="Open table of contents"
                onClick={() => setVisible(true)}
                class="md:hidden fixed bottom-6 right-6 z-40 inline-flex items-center justify-center rounded-full border border-[var(--c-border-strong)] bg-[var(--c-surface)] p-2 text-[var(--c-text-muted)] shadow-sm transition-colors hover:text-[var(--c-text)]"
            >
                <IconList width={20} height={20} class="block" />
            </button>
            <Show when={visible()}>
                <div
                    class="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
                    onClick={() => setVisible(false)}
                />
                <div class="md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-lg">
                    <div class="flex items-center justify-between px-4 pt-4 pb-2 text-xs uppercase tracking-wide text-[var(--c-text-subtle)]">
                        <span>{LL().sidebar.TOC()}</span>
                        <button
                            type="button"
                            onClick={() => setVisible(false)}
                            class="text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-text)]"
                        >
                            关闭
                        </button>
                    </div>
                    <div
                        ref={mobileRef!}
                        onClick={ClickToC}
                        class="max-h-[60vh] overflow-auto px-4 pb-6"
                        innerHTML={toc}
                    />
                </div>
            </Show>
        </div>
    )
}

export default ToC;
