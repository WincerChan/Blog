// @refresh reload
import '@unocss/reset/tailwind.css';
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
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
    <Html lang="en" class={theme.theme}>
      <Head>
        <Title>SolidStart - Bare</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <script innerHTML={`!function(){let e=localStorage.getItem('customer-theme')||''; if(e===''){e = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';};document.documentElement.setAttribute("class", e)}()`} />
      </Head>
      <Body class='bg-[var(--main-bg)] text-[var(--main-text)] font-base antialiased'>
        <Suspense>
          <ErrorBoundary>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
