import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createEffect, onMount, Suspense } from "solid-js";
import Footer from "./components/core/footer";
import Header from "./components/core/header";
import TypesafeI18n from "./i18n/i18n-solid";

import { type RouteSectionProps } from '@solidjs/router';
import { isServer } from "solid-js/web";
import { globalStore, setGlobalStore } from "./components/core/header/ThemeSwitch/Provider";
import { loadLocale } from "./i18n/i18n-util.sync";
import { Locale } from "./utils/locale";

import Plausible from "plausible-tracker";
let PlausibleTracker = 'default' in Plausible ? Plausible['default'] : Plausible;
const { trackPageview, trackEvent } = PlausibleTracker({
  domain: "blog.itswincer.com",
  apiHost: "https://track.itswincer.com",
})


const preloadHook = (props: RouteSectionProps<unknown>) => {
  return <MetaProvider>
    <Suspense>{props.children}</Suspense>
  </MetaProvider>
}

export default function App() {
  if (isServer) { loadLocale(globalStore.locale as Locale) }
  createEffect(() => {
    document.documentElement.className = globalStore.theme
  })
  onMount(() => {
    setGlobalStore({ trackEvent: trackEvent, trackPage: trackPageview })
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