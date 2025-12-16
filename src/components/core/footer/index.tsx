import { For, createMemo } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconGithub from "~icons/tabler/brand-github";
import IconTelegram from "~icons/tabler/brand-telegram";
import IconHome from "~icons/tabler/home-heart";
import IconPhoto from "~icons/tabler/photo-heart";
import Archives from "./Archives";
import Category from "./Category";
import Stats from "./Stats";
import BackTop from "./backTop";
import UpdateNotify from "./updateAvaliable";

const SINCE = 2017;

const FooterNav = () => {
  const { LL } = useI18nContext();
  const elems = [Stats, Category, Archives];
  const year = createMemo(() => new Date().getFullYear());
  return (
    <footer class=":: mt-16 bg-ers shadow-round py-5 <lg:px-4 ">
      <div class=":: xl:w-284 lg:w-220 mx-auto max-w-full ">
        <div class="::  mt-4 grid auto-cols-fr grid-flow-col text-sm leading-9 ">
          <For each={elems}>{(Elem, idx) => <Elem LL={LL} />}</For>
        </div>
        <div class="::  mt-6 justify-between mx-auto text-footer my-4 items-center ">
          <div class=":: space-x-6 my-4 text-[var(--extra)] z-0 ">
            <a title="Home" href="https://itswincer.com" target="_blank">
              <IconHome
                fill="currentColor"
                width={32}
                height={32}
                class=":: inline-block "
              />
            </a>
            <a
              title="Moments"
              href="https://moments.itswincer.com"
              target="_blank"
            >
              <IconPhoto
                fill="currentColor"
                width={32}
                height={32}
                class=":: inline-block "
              />
            </a>
            <a title="Telegram" href="https://t.me/Tivsae" target="_blank">
              <IconTelegram
                fill="currentColor"
                width={32}
                height={32}
                class=":: w-8 h-8 inline-block "
              />
            </a>
            <a
              title="Github"
              href="https://github.com/WincerChan"
              target="_blank"
            >
              <IconGithub
                fill="currentColor"
                width={32}
                height={32}
                class=":: w-8 h-8 inline-block "
              />
            </a>
          </div>
          <p class=":: text-sm leading-loose ">
            © {SINCE} - {year()} Wincer's Blog
            <span class="mx-2 inline-block">|</span>
            Designed and developed by{" "}
            <a
              class="hover:text-menu-transition"
              href="https://itswincer.com"
              target="_blank"
              rel="noopener"
            >
              Wincer
            </a>
            , powered by Velite + SolidStart
          </p>
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
