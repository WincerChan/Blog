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
    <footer class="">
      <div class="">
        <div class="">
          <For each={elems}>{(Elem, idx) => <Elem LL={LL} />}</For>
        </div>
        <div class="">
          <div class="">
            <a title="Home" href="https://itswincer.com" target="_blank">
              <IconHome
                fill="currentColor"
                width={32}
                height={32}
                class=""
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
                class=""
              />
            </a>
            <a title="Telegram" href="https://t.me/Tivsae" target="_blank">
              <IconTelegram
                fill="currentColor"
                width={32}
                height={32}
                class=""
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
                class=""
              />
            </a>
          </div>
          <p class="">
            © {SINCE} - {year()} Wincer's Blog
            <span class="">|</span>
            Designed and developed by{" "}
            <a
              class=""
              href="https://itswincer.com"
              target="_blank"
              rel="noopener"
            >
              Wincer
            </a>
            , powered by Velite + SolidStart{" · "}
            <a
              class=""
              href="https://github.com/WincerChan/Blog"
              target="_blank"
              rel="noopener"
            >
              Source
            </a>
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
