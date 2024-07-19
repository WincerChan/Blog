import { useBeforeLeave } from "@solidjs/router"
import nProgress from "nprogress"
import { JSXElement, createEffect, createSignal, onMount } from "solid-js"
import { useI18nContext } from "~/i18n/i18n-solid"
import { loadLocaleAsync } from "~/i18n/i18n-util.async"
import { Locale } from "~/utils/locale"
import { globalStore, setGlobalStore } from "../core/header/ThemeSwitch/Provider"

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
    const [trackPage, setTrackPage] = createSignal<TrackModuleProps>()
    useBeforeLeave(e => {
        if (!(e.to.toString().startsWith(e.from.pathname) && e.from.pathname !== "/")) nProgress.start()
    })
    onMount(() => {
        import("~/utils/track").then(v => {
            setGlobalStore({ trackEvent: v.trackEvent });
            setTrackPage(v)
        })
        nProgress.done()
    })
    createEffect(() => {
        trackPage()?.trackPageview()
    })
}

const localeHook = (lang?: Locale) => {
    lang = lang || 'zh-CN'
    if (lang != globalStore.locale) {
        setGlobalStore({ locale: lang })
    }
    const { setLocale } = useI18nContext()
    loadLocaleAsync(lang).then(() => setLocale(lang))
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