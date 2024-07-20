import { useBeforeLeave, useIsRouting } from "@solidjs/router"
import nProgress from "nprogress"
import { createEffect, createMemo, JSXElement, onMount } from "solid-js"
import { useI18nContext } from "~/i18n/i18n-solid"
import { loadLocaleAsync } from "~/i18n/i18n-util.async"
import { Locale } from "~/utils/locale"
import { globalStore } from "../core/header/ThemeSwitch/Provider"

interface MainProps {
    children: JSXElement,
    className?: string,
    lang?: Locale
}

interface TrackModuleProps {
    trackPageview: () => void
    trackEvent: (arg0: string, arg1: {}) => void
}

nProgress.configure({ showSpinner: false, speed: 200, trickleSpeed: 50 })

const trackHook = () => {
    useBeforeLeave(e => {
        if (!(e.to.toString().startsWith(e.from.pathname) && e.from.pathname !== "/")) nProgress.start()
    })
    onMount(() => {
        globalStore.trackPage()
        nProgress.done()
    })
}

const localeHook = (lang?: Locale) => {
    lang = lang || 'zh-CN'
    const isRouting = useIsRouting()
    const { setLocale } = useI18nContext()

    createEffect(() => {
        document.documentElement.lang = lang
    })
    createMemo(() => {
        if (isRouting())
            loadLocaleAsync(lang).then(() => setLocale(lang))
    })
    // setLocale(lang)
}

const MainLayout = ({ children, className, lang }: MainProps) => {
    trackHook();
    localeHook(lang)

    return (
        <main class={className}>
            {children}
        </main>
    )
}

export default MainLayout