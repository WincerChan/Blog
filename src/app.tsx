import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, createEffect, onMount } from "solid-js";
import Footer from "./site/footer";
import Header from "./site/header";
import TypesafeI18n from "./i18n/i18n-solid";

import { type RouteSectionProps } from "@solidjs/router";
import {
    globalStore,
    setGlobalStore,
} from "./features/theme";
import { applyTheme } from "./features/theme";
import { Locale } from "./utils/locale";

import { getRequestEvent, isServer } from "solid-js/web";
import { loadLocale } from "./i18n/i18n-util.sync";
import { trackEngage, trackPage } from "./utils/track";

const normalizePath = (pathname: string) =>
    pathname.endsWith("/") ? pathname : `${pathname}/`;

const detectLocaleFromPath = (pathname: string): Locale => {
    const p = normalizePath(pathname);
    if (p.endsWith("-en/")) return "en";
    if ((__CONTENT_EN_POSTS as unknown as string[]).includes(p)) return "en";
    return "zh-CN";
};

const preloadHook = (props: RouteSectionProps<unknown>) => {
    return (
        <MetaProvider>
            <Suspense>{props.children}</Suspense>
        </MetaProvider>
    );
};

export default function App() {
    let locale: Locale = "zh-CN";
    if (isServer) {
        const evt = getRequestEvent();
        const url = evt?.request?.url;
        const pathname = url ? new URL(url).pathname : "/";
        locale = detectLocaleFromPath(pathname);
        setGlobalStore({ locale: locale });
        loadLocale(locale);
    }
    createEffect(() => {
        applyTheme(globalStore.theme);
    });
    onMount(() => {
        setGlobalStore({ trackPage, trackEngage });
    });
    return (
        <TypesafeI18n locale={globalStore.locale as Locale}>
            <div class=":: font-base antialiased bg-main text-main md:grid md:min-h-screen grid-rows-[auto_1fr_auto] ">
                <Header />
                <Router root={(props) => preloadHook(props)}>
                    <FileRoutes />
                </Router>
                <Footer />
            </div>
        </TypesafeI18n>
    );
}
