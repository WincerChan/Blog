// @refresh reload
import '@unocss/reset/tailwind.css';
import { Suspense, lazy } from 'solid-js';
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
import EmptyLayout from './components/layouts/EmptyLayout';

const FileR = lazy(() => import("solid-start/root/FileRoutes"));

export default function Root() {
  return (
    <Html lang="zh-CN" class={theme.theme}>

      <Head>
        <script src="https://cdn.bootcdn.net/ajax/libs/nanobar/0.4.2/nanobar.min.js"></script>
      </Head>
      <Body class='bg-[var(--main-bg)] text-[var(--main-text)] font-base antialiased'>
        <Suspense fallback={<EmptyLayout />}>
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
