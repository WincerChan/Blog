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
import { set, val } from './components/core/header/ThemeSwitch/Provider';


export default function Root() {
  onMount(() => {
    if (__IS_PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker?.addEventListener('statechange', () => {
              switch (newWorker.state) {
                case 'installed':
                  if (navigator.serviceWorker.controller) set({ 'sw-notify': true })
                  break;
                case 'redundant':
                  break;
              }
            });
          });
        })
    }
  })
  return (
    <Html lang="zh-CN" class={val.theme}>
      <Head>
        <script innerHTML={`window.lt=()=>localStorage.getItem('customer-theme')||'auto';window.mt=()=>window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';!function(){let e=window.lt(); if(e==='auto') e = window.mt();document.documentElement.setAttribute("class", e);}()`} />
      </Head>
      <Body class=':: bg-[var(--main-bg)] text-[var(--main-text)] font-base antialiased body-responsive '>
        <Header />
        <main class=":: w-view main-responsive grid-cols-50 ">
          <Suspense>
            <Routes>
              <FileRoutes />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <Scripts />
      </Body>
    </Html>
  );
}
