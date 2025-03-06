import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createEffect, onMount, Suspense } from "solid-js";
import Footer from "./components/core/footer";
import Header from "./components/core/header";
import TypesafeI18n from "./i18n/i18n-solid";

import { type RouteSectionProps } from "@solidjs/router";
import {
    globalStore,
    setGlobalStore,
} from "./components/core/header/ThemeSwitch/Provider";
import { Locale } from "./utils/locale";

import Plausible from "plausible-tracker";
import { isServer } from "solid-js/web";
import { loadLocale } from "./i18n/i18n-util.sync";
let PlausibleTracker =
    "default" in Plausible ? Plausible["default"] : Plausible;
const { trackPageview, trackEvent } = PlausibleTracker({
    domain: "blog.itswincer.com",
    apiHost: "https://track.itswincer.com",
});

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
        globalThis.renderCount ??= 0;
        if (++globalThis.renderCount < __EN_POSTS.length) locale = "en";
        setGlobalStore({ locale: locale });
        loadLocale(locale);
    }
    createEffect(() => {
        document.documentElement.className = globalStore.theme;
    });
    onMount(() => {
        setGlobalStore({ trackEvent: trackEvent, trackPage: trackPageview });
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
