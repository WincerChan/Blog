import { createMemo } from "solid-js";
import config from "~/../hugo.json";

const SINCE = 2017

const Footer = () => {
    const year = createMemo(() => new Date().getFullYear())
    return (
        <footer class="mt-8 bg-ers shadow-round py-5">
            <div class="w-view <lg:px-6 mx-auto text-footer my-4">
                <p class="text-sm leading-loose">
                    © {SINCE} - {year()} {' '}
                    {config.title}
                </p>
                <p class="text-sm leading-loose">
                    Designed and developed by <a
                        class="text-menuHover"
                        href="https://itswincer.com"
                        target="_blank"
                        rel="noopener">Wincer</a
                    >, powered by Hugo + Next.js
                </p>
            </div>
        </footer>

    )
}
export default Footer;