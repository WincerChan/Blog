import { Show, createSignal, onMount } from "solid-js"

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
        window.addEventListener('scroll', handleScroll)
    })

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }


    return (
        <Show when={visible()}>
            <button
                class=":: fixed bottom-10 right-10 z-10 p-2 rounded shadow-round bg-[var(--ers-bg)]"
                onClick={scrollToTop}
            >
                <i class=":: i-carbon-up-to-top w-8 h-8 text-[var(--meta-bg)]" />
            </button>
        </Show>
    )
}

export default BackTop