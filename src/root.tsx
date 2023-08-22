// @refresh reload
import '@unocss/reset/tailwind.css';
import "nprogress/nprogress.css";
import { Suspense, onMount } from 'solid-js';
import {
  Body,
  FileRoutes,
  Head,
  Html,
  Routes,
  Scripts
} from "solid-start";
import 'uno.css';
import '~/styles/root.css';
import Footer from './components/core/footer';
import Header from './components/core/header';
import { val } from './components/core/header/ThemeSwitch/Provider';
import { trackPageview } from './utils/track';


export default function Root() {
  onMount(() => {
    trackPageview()
  })
  return (
    <Html class={val.theme} lang={val.lang}>
      <Head>
        <script innerHTML={`window.lt=()=>localStorage.getItem('customer-theme')||'auto';window.mt=()=>window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';!function(){let e=window.lt(); if(e==='auto') e = window.mt();document.documentElement.setAttribute("class", e);}()`} />
      </Head>
      <Body style={{ overflow: val.modal ? 'hidden' : "" }} class=':: bg-[var(--main-bg)] text-[var(--main-text)] font-base antialiased body-responsive '>
        <Header />
        <Suspense>
          <Routes>
            <FileRoutes />
          </Routes>
        </Suspense>
        <Footer />
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
