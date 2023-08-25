// @refresh reload
import '@unocss/reset/tailwind.css';
import "nprogress/nprogress.css";
import { Suspense, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';
import {
  Body,
  FileRoutes,
  Head,
  Html,
  Routes,
  Scripts,
  useLocation
} from "solid-start";
import 'uno.css';
import '~/styles/root.css';
import Footer from './components/core/footer';
import Header from './components/core/header';
import { set, val } from './components/core/header/ThemeSwitch/Provider';
import TypesafeI18n from './i18n/i18n-solid';
import { loadLocale } from './i18n/i18n-util.sync';
import { trackPageview } from './utils/track';


export default function Root() {
  onMount(() => {
    trackPageview()
  })
  let lang;
  if (isServer) {
    const k = useLocation()
    lang = "zh-CN"
    __EN_POSTS.forEach(v => {
      if (k.pathname.includes(v)) lang = "en"
    })
  }
  const realLang = lang || "zh-CN"
  if (isServer)
    loadLocale(realLang.startsWith("zh") ? "zh" : "en")


  set({ lang: realLang })
  return (
    <Html class={val.theme} lang={lang ?? val.lang}>
      <Head>
        <script innerHTML={`window.lt=()=>localStorage.getItem('customer-theme')||'auto';window.mt=()=>window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';!function(){let e=window.lt(); if(e==='auto') e = window.mt();document.documentElement.setAttribute("class", e);}()`} />
      </Head>
      <Body style={{ overflow: val.modal ? 'hidden' : "" }} class=':: bg-[var(--main-bg)] text-[var(--main-text)] font-base antialiased body-responsive '>
        <TypesafeI18n locale={realLang.startsWith("zh") ? "zh" : "en"} >
          <Header />
          <Suspense>
            <Routes>
              <FileRoutes />
            </Routes>
          </Suspense>
          <Footer />
        </TypesafeI18n>
        <Scripts />
      </Body>
    </Html>
  );
}
