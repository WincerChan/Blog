import { For, createMemo } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconGithub from "~icons/tabler/brand-github";
import IconTelegram from "~icons/tabler/brand-telegram";
import IconHome from "~icons/tabler/home-heart";
import IconPhoto from "~icons/tabler/photo-heart";
import Archives from "./Archives";
import Category from "./Category";
import Stats from "./Stats";
import BackTop from "../widgets/BackTop";
import UpdateNotify from "~/features/pwa/UpdateNotify";

const SINCE = 2017;

const FooterNav = () => {
  const { LL } = useI18nContext();
  const elems = [Stats, Category, Archives];
  const year = createMemo(() => new Date().getFullYear());
  return (
    <footer class="w-full border-t border-[var(--c-border)] bg-[var(--c-bg)]">
      <div class="w-full max-w-5xl mx-auto px-4 md:px-6 py-10">
        <div class="flex items-center gap-2">
          <a
            title="Home"
            href="https://itswincer.com"
            target="_blank"
            class="inline-flex items-center justify-center rounded-md p-2 text-[var(--c-text-muted)] hover:text-[var(--c-link)] hover:bg-[var(--c-hover-bg)] transition-colors"
          >
            <IconHome fill="currentColor" width={28} height={28} />
          </a>
          <a
            title="Moments"
            href="https://moments.itswincer.com"
            target="_blank"
            class="inline-flex items-center justify-center rounded-md p-2 text-[var(--c-text-muted)] hover:text-[var(--c-link)] hover:bg-[var(--c-hover-bg)] transition-colors"
          >
            <IconPhoto fill="currentColor" width={28} height={28} />
          </a>
          <a
            title="Telegram"
            href="https://t.me/Tivsae"
            target="_blank"
            class="inline-flex items-center justify-center rounded-md p-2 text-[var(--c-text-muted)] hover:text-[var(--c-link)] hover:bg-[var(--c-hover-bg)] transition-colors"
          >
            <IconTelegram fill="currentColor" width={28} height={28} />
          </a>
          <a
            title="Github"
            href="https://github.com/WincerChan"
            target="_blank"
            class="inline-flex items-center justify-center rounded-md p-2 text-[var(--c-text-muted)] hover:text-[var(--c-link)] hover:bg-[var(--c-hover-bg)] transition-colors"
          >
            <IconGithub fill="currentColor" width={28} height={28} />
          </a>
        </div>
        <div class="mt-8 flex flex-col gap-8 md:flex-row md:justify-between md:gap-12">
          <For each={elems}>
            {(Elem) => (
              <div class="w-full md:w-56">
                <Elem LL={LL} />
              </div>
            )}
          </For>
        </div>
        <div class="mt-10 border-t border-[var(--c-border)] pt-4 flex flex-col gap-2 text-xs text-[var(--c-text-muted)] md:flex-row md:items-center md:justify-between">
          <p>
            © {SINCE} - {year()} Wincer's Blog
            <span class="px-2 text-[var(--c-text-subtle)]">|</span>
            Designed and developed by{" "}
            <a
              class="text-[var(--c-text-muted)] hover:text-[var(--c-link)] transition-colors"
              href="https://itswincer.com"
              target="_blank"
              rel="noopener"
            >
              Wincer
            </a>
            , powered by Velite + SolidStart
          </p>
          <div class="flex items-center gap-3">
            <a
              class="text-[var(--c-text-muted)] hover:text-[var(--c-link)] transition-colors"
              href="https://github.com/WincerChan/Blog"
              target="_blank"
              rel="noopener"
            >
              Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Footer = () => {
  return (
    <>
      <BackTop />
      <UpdateNotify />
      <FooterNav />
    </>
  );
};

export default Footer;
