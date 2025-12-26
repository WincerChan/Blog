import { JSXElement, Show, createEffect } from "solid-js"

interface ModalProps {
    children: JSXElement
    toggle: () => boolean,
    setToggle: (toggle: boolean) => void
}

const Modal = ({ children, toggle, setToggle }: ModalProps) => {
    createEffect(() => {
        if (toggle())
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
