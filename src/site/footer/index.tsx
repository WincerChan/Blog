import { For, createMemo } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconGithub from "~icons/ph/github-logo";
import IconTelegram from "~icons/ph/telegram-logo";
import IconHome from "~icons/ph/house";
import IconPhoto from "~icons/ph/images-square";
import IconDotFill from "~icons/ph/dot-outline-fill";
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
    <footer class="w-full border-t border-[var(--c-border)] bg-[var(--c-surface-2)]">
      <div class="w-full max-w-5xl mx-auto px-4 md:px-6 py-10">
        <div class="flex items-center gap-6">
          <a
            title="Home"
            href="https://itswincer.com"
            target="_blank"
            class="inline-flex items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
          >
            <IconHome fill="currentColor" width={28} height={28} />
          </a>
          <a
            title="Moments"
            href="https://moments.itswincer.com"
            target="_blank"
            class="inline-flex items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
          >
            <IconPhoto fill="currentColor" width={28} height={28} />
          </a>
          <a
            title="Telegram"
            href="https://t.me/Tivsae"
            target="_blank"
            class="inline-flex items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
          >
            <IconTelegram fill="currentColor" width={28} height={28} />
          </a>
          <a
            title="Github"
            href="https://github.com/WincerChan"
            target="_blank"
            class="inline-flex items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
          >
            <IconGithub fill="currentColor" width={28} height={28} />
          </a>
        </div>
        <div class="mt-8 flex flex-wrap gap-8 md:flex-row md:justify-between md:gap-12">
          <For each={elems}>
            {(Elem) => (
              <div class="md:w-[12rem] flex-1 md:flex-none md:w-56">
                <Elem LL={LL} />
              </div>
            )}
          </For>
        </div>
        <div class="mt-10 border-t border-[var(--c-border)] pt-4 flex flex-col gap-2 text-sm leading-loose text-[var(--c-text-muted)] md:flex-row md:items-center md:justify-between">
          <p>
            © {SINCE} - {year()} Wincer's Blog
            <span class="px-2 text-[var(--c-text-subtle)]">|</span>
            Designed and developed by{" "}
            <a
              class="text-[var(--c-text-muted)] underline decoration-1 underline-offset-4 decoration-[var(--c-border-strong)] hover:text-[var(--c-text)] hover:decoration-[var(--c-text)] transition-colors"
              href="https://itswincer.com"
              target="_blank"
              rel="noopener"
            >
              Wincer
            </a>
          </p>
          <div class="flex items-center gap-2 self-center md:self-auto">
            <a
              class="text-[var(--c-text-muted)] underline decoration-1 underline-offset-4 decoration-[var(--c-border-strong)] hover:text-[var(--c-text)] hover:decoration-[var(--c-text)] transition-colors"
              href="/privacy/"
            >
              Privacy
            </a>
            <IconDotFill width={10} height={10} class="text-[var(--c-text-subtle)]" />
            <a
              class="text-[var(--c-text-muted)] underline decoration-1 underline-offset-4 decoration-[var(--c-border-strong)] hover:text-[var(--c-text)] hover:decoration-[var(--c-text)] transition-colors"
              href="/support/"
            >
              Support
            </a>
            <IconDotFill width={10} height={10} class="text-[var(--c-text-subtle)]" />
            <a
              class="text-[var(--c-text-muted)] underline decoration-1 underline-offset-4 decoration-[var(--c-border-strong)] hover:text-[var(--c-text)] hover:decoration-[var(--c-text)] transition-colors"
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
