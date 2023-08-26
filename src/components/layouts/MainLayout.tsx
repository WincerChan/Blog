import { useBeforeLeave } from "@solidjs/router"
import nProgress from "nprogress"
import { JSXElement, onMount } from "solid-js"
import { useI18nContext } from "~/i18n/i18n-solid"
import { loadLocaleAsync } from "~/i18n/i18n-util.async"
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
    const currLang = lang ?? 'zh-CN'
    const { setLocale } = useI18nContext()
    if (val.lang != currLang) {
        set({ lang: currLang })
    }
    loadLocaleAsync(currLang as "zh-CN" | "en").then(() => setLocale(currLang as "zh-CN" | "en"))

    return (
        <main class={className}>
            {children}
        </main>
    )
}

export default MainLayout