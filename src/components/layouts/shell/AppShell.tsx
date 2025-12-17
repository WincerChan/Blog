import { useBeforeLeave } from "@solidjs/router";
import nProgress from "nprogress";
import { JSXElement, createEffect, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import { loadLocaleAsync } from "~/i18n/i18n-util.async";
import { globalStore, setGlobalStore } from "~/components/core/header/ThemeSwitch/Provider";
import { Locale } from "~/utils/locale";

interface MainProps {
    children: JSXElement;
    className?: string;
    lang?: Locale;
}

nProgress.configure({ showSpinner: false, speed: 200, trickleSpeed: 50 });

const trackHook = () => {
    useBeforeLeave((e) => {
        const to_path = e.to.toString(),
            from_path = e.from.pathname;
        if (!(to_path == from_path || (to_path.startsWith(from_path) && from_path !== "/")))
            nProgress.start();
    });

    onMount(() => {
        nProgress.done();
        setTimeout(() => {
            globalStore.trackPage();
        }, 100);
    });
};

const localeHook = (lang?: Locale) => {
    lang = lang || "zh-CN";
    const { setLocale } = useI18nContext();

    createEffect(() => {
        document.documentElement.lang = lang;
        if (globalStore.locale !== lang) setGlobalStore({ locale: lang });
        loadLocaleAsync(lang).then(() => setLocale(lang));
    });
};


const AppShell = ({ children, className, lang }: MainProps) => {
    globalThis.loadedLocale = false;

    trackHook();
    localeHook(lang);

    return (
        <main class={className}>
            {children}
        </main>
    );
};

export default AppShell;
