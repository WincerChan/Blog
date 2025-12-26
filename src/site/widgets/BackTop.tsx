import { createSignal, onCleanup, onMount } from "solid-js"
import IconUptoTop from "~icons/carbon/up-to-top"

const BackTop = () => {
    const [visible, setVisible] = createSignal(false)

    const handleScroll = () => {
        if (document.documentElement.scrollTop > 96) {
            setVisible(true)
        } else {
            setVisible(false)
        }
    }

    onMount(() => {
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        onCleanup(() => window.removeEventListener("scroll", handleScroll))
    })

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }


    return (
        <button
            type="button"
            class="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center rounded-full border border-[var(--c-border)] bg-[var(--c-bg-glass)] p-2 text-[var(--c-text-muted)] shadow-sm backdrop-blur-sm transition-all duration-200 ease-out"
            classList={{
                "opacity-0 translate-y-2 pointer-events-none": !visible(),
                "opacity-100 translate-y-0": visible(),
            }}
            onClick={scrollToTop}
            aria-label="Back to top"
        >
            <IconUptoTop width={28} height={28} class="block" />
        </button>
    )
}

export default BackTop
