import config from "@/hugo.json";
import { createMemo } from "solid-js";
import { A } from "solid-start";
import Archives from "../sidebar/Archives";
import Category from "../sidebar/Category";
import Stats from "../sidebar/Stats";
import Tags from "../sidebar/Tags";
import BackTop from "./backTop";
import UpdateNotify from "./updateAvaliable";

const SINCE = 2017

const Copyright = () => {
    const year = createMemo(() => new Date().getFullYear())
    return (
        <footer class=":: mt-16 bg-ers shadow-round py-5 ">
            <div class="w-view mt-4 flex text-sm space-x-8 leading-9 justify-between <md:px-4">
                <Stats />
                <Category />
                <Archives />
                <Tags />
            </div>
            <div class=":: w-view mt-8 lg:flex justify-between mx-auto text-footer my-4 <md:px-4 ">
                <div class="space-x-6 <lg:my-6 text-[var(--extra)]">
                    <A title="Home" inactiveClass="" activeClass="" href="https://itswincer.com" target="_blank">
                        <i class="i-bx-home-heart w-8 h-8 inline-block" />
                    </A>
                    <A title="Github" inactiveClass="" activeClass="" href="https://github.com/WincerChan" target="_blank">
                        <i class="i-bx-bxl-github w-8 h-8 inline-block" />
                    </A>
                    <A title="Telegram" inactiveClass="" activeClass="" href="https://t.me/Tivsae" target="_blank">
                        <i class="i-bx-bxl-telegram w-8 h-8 inline-block" />
                    </A>
                    <A title="BuyMeaCoffee Donate" inactiveClass="" activeClass="" href="https://www.buymeacoffee.com/wincer" target="_blank">
                        <i class="i-bx-coffee-togo w-8 h-8 inline-block" />
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
            <Copyright />
        </>
    )
}

export default Footer;