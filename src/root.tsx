// @refresh reload
import '@unocss/reset/tailwind.css';
import {
  Body,
  FileRoutes,
  Head,
  Html,
  Routes,
  Scripts,
  useNavigate,
  useParams
} from "solid-start";
import 'uno.css';
import '~/styles/root.css';
import { theme } from './components/core/header/ThemeSwitch/Provider';

function RedirectWithTrailingSlash() {
  const navigate = useNavigate();
  const params = useParams();

  // 在 URL 末尾添加斜线（如果没有的话），并导航到新 URL
  const redirectToTrailingSlashUrl = () => {
    const path = params.path || "";
    if (!path.endsWith("/")) {
      navigate(`/${path}/`);
    }
  };

  redirectToTrailingSlashUrl();

  return null;
}

export default function Root() {
  return (
    <Html lang="zh-CN" class={theme.theme}>
      <Head />
      <Body class='bg-[var(--main-bg)] text-[var(--main-text)] font-base antialiased'>
        <Routes>
          <FileRoutes />
        </Routes>
        <Scripts />
        <script innerHTML={`if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/sw.js', { scope: '/' })})}`} />
      </Body>
    </Html>
  );
}
