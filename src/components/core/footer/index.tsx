import config from "@/hugo.json";
import { For, createMemo } from "solid-js";
import { A } from "solid-start";
import { useI18nContext } from "~/i18n/i18n-solid";
import Archives from "./Archives";
import Category from "./Category";
import Stats from "./Stats";
import Tags from "./Tags";
import BackTop from "./backTop";
import UpdateNotify from "./updateAvaliable";

const SINCE = 2017

const FooterNav = () => {
    const { LL } = useI18nContext()
    const elems = [
        Stats,
        Category,
        Archives,
        Tags
    ]
    const year = createMemo(() => new Date().getFullYear())
    return (
        <footer class=":: mt-16 bg-ers shadow-round py-5 <lg:px-4 ">
            <div class=":: w-view mt-4 grid auto-cols-fr grid-flow-col text-sm leading-9 ">
                <For each={elems}>
                    {(Elem, idx) => (<Elem LL={LL} />)}
                </For>
            </div>
            <div class=":: w-view mt-6 justify-between mx-auto text-footer my-4 items-center ">
                <div class=":: space-x-6 my-4 text-[var(--extra)] z-0 ">
                    <A title="Home" inactiveClass="" activeClass="" href="https://itswincer.com" target="_blank">
                        <i class="i-bx-home-heart w-8 h-8 inline-block" />
                    </A>
                    <A title="Github" inactiveClass="" activeClass="" href="https://github.com/WincerChan" target="_blank">
                        <i class="i-bx-bxl-github w-8 h-8 inline-block" />
                    </A>
                    <A title="Telegram" inactiveClass="" activeClass="" href="https://t.me/Tivsae" target="_blank">
                        <i class="i-bx-bxl-telegram w-8 h-8 inline-block" />
                    </A>
                </div>
                <p class=":: text-sm leading-loose ">
                    © {SINCE} - {year()} {' '}
                    {config.title}<span class="mx-2 inline-block">|</span>
                    Designed and developed by <a
                        class="text-menuHover"
                        href="https://itswincer.com"
                        target="_blank"
                        rel="noopener">Wincer</a
                    >, powered by Hugo + SolidStart
                </p>
            </div>
        </footer>
    )
}

const Footer = () => {
    return (
        <>
            <BackTop />
            <UpdateNotify />
            <FooterNav />
        </>
    )
}

export default Footer;