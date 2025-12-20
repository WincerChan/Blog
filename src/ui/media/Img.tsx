import { createEffect, createSignal } from "solid-js";

const LazyImg = ({ src, ...rest }) => {
    const [visible, setVisible] = createSignal(false)
    const SVGFallback = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    let self: HTMLImageElement;
    createEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setVisible(true)
                observer.unobserve(entries[0].target)
            }
        })
        observer.observe(self as HTMLImageElement)
    })

    return (
        <img ref={self!} {...rest} src={visible() ? src : SVGFallback} />
    )
}

export default LazyImg;
