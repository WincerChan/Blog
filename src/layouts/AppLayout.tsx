import { JSXElement, createEffect, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import { loadLocaleAsync } from "~/i18n/i18n-util.async";
import { globalStore, setGlobalStore } from "~/features/theme";
import { Locale } from "~/utils/locale";

interface MainProps {
    children: JSXElement;
    className?: string;
    lang?: Locale;
}

const trackHook = () => {
    onMount(() => {
        setTimeout(() => {
            globalStore.trackPage();
        }, 100);
    });
};

const localeHook = (lang: () => Locale | undefined) => {
    const { setLocale } = useI18nContext();

    createEffect(() => {
        const next = lang() || "zh-CN";
        document.documentElement.lang = next;
        if (globalStore.locale !== next) setGlobalStore({ locale: next });
        loadLocaleAsync(next).then(() => setLocale(next));
    });
};


const AppLayout = (props: MainProps) => {
    trackHook();
    localeHook(() => props.lang);

    return (
        <main class={props.className}>
            {props.children}
        </main>
    );
};

export default AppLayout;
