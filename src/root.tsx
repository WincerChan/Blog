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
import { theme } from './components/core/header/ThemeSwitch/Provider';


export default function Root() {
  return (
    <Html lang="zh-CN" class={theme.theme}>
      <Head />
      <Body class='bg-[var(--main-bg)] text-[var(--main-text)] font-base antialiased'>
        <Suspense>
          <Routes>
            <FileRoutes />
          </Routes>
        </Suspense>
        <Scripts />
        {__IS_PROD ?
          <script innerHTML={`if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/sw.js', { scope: '/' })})}`} />
          : ""}
      </Body>
    </Html>
  );
}
