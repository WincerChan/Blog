import { JSXElement, createEffect } from "solid-js";
import { useBeforeLeave, useLocation } from "@solidjs/router";
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
    const location = useLocation();

    useBeforeLeave(() => {
        globalStore.trackEngage(true);
    });

    createEffect(() => {
        if (location.pathname) globalStore.trackPage(location.pathname);
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
        <main class="w-full pb-16 md:pb-20 flex-1">
            {props.children}
        </main>
    );
};

export default AppLayout;
