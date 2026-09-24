import { Element, Show, createEffect } from "solid-js"

interface ModalProps {
    children: Element
    toggle: () => boolean,
    setToggle: (toggle: boolean) => void
}

const Modal = ({ children, toggle, setToggle }: ModalProps) => {
    createEffect(toggle, (open) => {
        if (open)
            document.body.style.overflow = 'hidden'
        else
            document.body.style.overflow = ''
    })
    return (
        <Show when={toggle()}>
            <div onClick={() => setToggle(false)} class="" />
            {children}
        </Show>
    )
}

export default Modal
