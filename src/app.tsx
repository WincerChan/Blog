import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createEffect, Suspense } from "solid-js";
import Footer from "./components/core/footer";
import Header from "./components/core/header";
import TypesafeI18n from "./i18n/i18n-solid";

import { type RouteSectionProps } from '@solidjs/router';
import { isServer } from "solid-js/web";
import { globalStore } from "./components/core/header/ThemeSwitch/Provider";
import { loadLocale } from "./i18n/i18n-util.sync";
import { Locale } from "./utils/locale";

const preloadHook = (props: RouteSectionProps<unknown>) => {
  return <MetaProvider>
    <Suspense>{props.children}</Suspense>
  </MetaProvider>
}

export default function App() {
  if (isServer) loadLocale(globalStore.locale as Locale)
  createEffect(async () => {
    document.documentElement.lang = globalStore.locale
    document.documentElement.className = globalStore.theme
  })
  return (
    <TypesafeI18n locale={globalStore.locale as Locale}>
      <Header />
      <Router
        root={props => preloadHook(props)}
      >
        <FileRoutes />
      </Router >
      <Footer />
    </TypesafeI18n>
  );
}