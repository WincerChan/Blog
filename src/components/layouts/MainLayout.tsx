import { useBeforeLeave } from "@solidjs/router"
import nProgress from "nprogress"
import { JSXElement, onMount } from "solid-js"
import { trackPageview } from "~/utils/track"
import { set, val } from "../core/header/ThemeSwitch/Provider"

interface MainProps {
    children: JSXElement,
    className?: string,
    lang?: string
}

nProgress.configure({ showSpinner: false, speed: 200, trickleSpeed: 50 })

const MainLayout = ({ children, className, lang }: MainProps) => {
    useBeforeLeave(e => {
        if (!(e.to.toString().startsWith(e.from.pathname) && e.from.pathname !== "/")) nProgress.start()
        trackPageview({ url: `${window.location.origin}${e.to.toString()}` })
    })
    onMount(() => {
        nProgress.done()
    })
    const currLang = lang || 'zh-CN'
    if (val.lang !== currLang) set({ lang: currLang })
    return (
        <main class={className}>
            {children}
        </main>
    )
}

export default MainLayout