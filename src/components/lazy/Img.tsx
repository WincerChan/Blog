import { createEffect, createSignal } from "solid-js";

const LazyImg = ({ src, ...rest }) => {
    const [visible, setVisible] = createSignal(false)
    const SVGFallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPgo='
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