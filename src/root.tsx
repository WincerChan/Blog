// @refresh reload
import '@unocss/reset/tailwind.css';
import "nprogress/nprogress.css";
import { Suspense } from 'solid-js';
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
import BackTop from './components/core/footer/backTop';
import Header from './components/core/header';
import { val } from './components/core/header/ThemeSwitch/Provider';


export default function Root() {
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
        <BackTop />
        <Scripts />
        {__IS_PROD ? <script async defer data-website-id="d50e9a0c-1726-40f7-b622-7bbf7aa989bc"
          src="https://api.itswincer.com/react/route.js" /> : <></>}
        {__IS_PROD ?
          <script innerHTML={`if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/sw.js', { scope: '/' })})}`} />
          : ""}
      </Body>
    </Html>
  );
}
