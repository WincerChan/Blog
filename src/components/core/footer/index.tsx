import config from "@/hugo.json";
import { createMemo } from "solid-js";

const SINCE = 2017

const Footer = () => {
    const year = createMemo(() => new Date().getFullYear())
    return (
        <footer class=":: mt-8 bg-ers shadow-round py-5 ">
            <div class=":: w-view mx-auto text-footer my-4 <lg:px-6 ">
                <p class=":: text-sm leading-loose ">
                    © {SINCE} - {year()} {' '}
                    {config.title}
                </p>
                <p class=":: text-sm leading-loose ">
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
export default Footer;