// @refresh reload
import '@unocss/reset/tailwind.css';
import "nprogress/nprogress.css";
import { Suspense } from 'solid-js';
import { isServer } from 'solid-js/web';
import {
  Body,
  FileRoutes,
  Head,
  Html,
  Meta,
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


export default function Root() {
  let lang;
  if (isServer) {
    const k = useLocation()
    lang = "zh-CN"
    __EN_POSTS.forEach(v => {
      if (k.pathname.includes(v)) lang = "en"
    })
  }
  const realLang = lang ?? "zh-CN"
  if (isServer)
    loadLocale(realLang)


  set({ lang: realLang })
  return (
    <Html class={val.theme} lang={lang ?? val.lang}>
      <Head>
        <Meta charset='utf-8' />
        <script innerHTML={`window.lt=()=>localStorage.getItem('customer-theme')||'auto';window.mt=()=>window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';!function(){let e=window.lt(); if(e==='auto') e = window.mt();document.documentElement.setAttribute("class", e);}()`} />
      </Head>
      <Body style={{ overflow: val.modal ? 'hidden' : "" }} class=':: bg-[var(--main-bg)] text-[var(--main-text)] font-base antialiased body-responsive '>
        <TypesafeI18n locale={realLang} >
          <Header />
          <Suspense>
            <Routes>
              <FileRoutes />
            </Routes>
          </Suspense>
          <Footer />
        </TypesafeI18n>
        <Scripts />
        <script innerHTML={`
        if (__IS_PROD && 'serviceWorker' in navigator) {
          navigator.serviceWorker.register("/sw.js?v=${import.meta.env.VITE_ASSET_VERSION}",{scope:"/"}).then(reg => {
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              newWorker?.addEventListener('statechange', () => {
                switch (newWorker.state) {
                  case 'installed':
                    if (navigator.serviceWorker.controller) document.getElementById('sw-notify').style.display = 'block'
                    break;
                  case 'redundant':
                    break;
                }
              });
            });
          })
        }
        `} />
      </Body>
    </Html>
  );
}
