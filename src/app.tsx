import { Loading, createEffect, onSettled } from "solid-js";
import { getRequestEvent, isServer } from "@solidjs/web";
import { Router } from "./router";
import Footer from "./site/footer";
import Header from "./site/header";
import TypesafeI18n from "./i18n/i18n-solid";
import ApplicationMeta from "./site/seo/ApplicationMeta";
import { theme, applyTheme } from "./features/theme";
import { detectLocaleFromPath } from "./utils/locale";
import { registerServiceWorker } from "./utils/sw";
import '@unocss/reset/tailwind.css';
import "~/styles/color.css";
import "~/styles/base.css";
import "~/styles/article.css";
import "virtual:uno.css";

export default function App() {
    const pathname = isServer
        ? new URL(getRequestEvent()!.request.url).pathname
        : window.location.pathname;
    createEffect(theme, applyTheme);
    onSettled(() => {
        if (import.meta.env.PROD) registerServiceWorker();
    });
    return (
        <TypesafeI18n locale={detectLocaleFromPath(pathname)}>
            <ApplicationMeta />
            <Router>{(props) => (
                <div class="min-h-screen flex flex-col">
                    <Header />
                    <Loading>{props.children}</Loading>
                    <Footer />
                </div>
            )}</Router>
        </TypesafeI18n>
    );
}
