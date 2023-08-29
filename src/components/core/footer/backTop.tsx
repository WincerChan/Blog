import { Show, createSignal, onMount } from "solid-js"
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
                class=":: fixed bottom-10 right-10 p-2 rounded shadow-round text-[var(--meta-bg)] bg-[var(--ers-bg)] "
                onClick={scrollToTop}
            >
                <IconUptoTop width={32} height={32} />
            </button>
        </Show>
    )
}

export default BackTop