import { createEffect, createSignal } from "solid-js";

const LazyBg = ({ dataSrc, ...props }: any) => {
    if (!dataSrc) return (<div {...props}>{props.children}</div>)
    const [visible, setVisible] = createSignal(false)
    const style = {
        "background-image": `url(${dataSrc})`,
    }
    let self: HTMLDivElement;
    createEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {

                setVisible(true)
                observer.unobserve(entries[0].target)
            }
        })
        observer.observe(self as HTMLDivElement)
    })
    return (
        <div ref={self!} {...props} style={visible() ? style : {}}>{props.children}</div>
    )
}

export default LazyBg;