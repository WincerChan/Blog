import { JSXElement, Show, createEffect } from "solid-js"
import { set } from "../header/ThemeSwitch/Provider"

interface ModalProps {
    children: JSXElement
    toggle: () => boolean,
    setToggle: (toggle: boolean) => void
}

const Modal = ({ children, toggle, setToggle }: ModalProps) => {
    createEffect(() => {
        set({ "modal": toggle() })
    })
    return (
        <Show when={toggle()}>
            <div onClick={() => setToggle(false)} class="fixed w-screen top-0 h-screen left-0 bg-[var(--meta-bg)] z-20" />
            {children}
        </Show>
    )
}

export default Modal