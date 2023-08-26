import { A } from "solid-start"
import { useI18nContext } from "~/i18n/i18n-solid"
import { trackEvent } from "~/utils/track"
import ToggleButton from "./ThemeSwitch/Switcher"

const Tools = () => {
    const { locale } = useI18nContext()
    return (
        <ul class="flex">
            <li class=":: bg-menuHover trans-linear text-menuHover text-menu ">
                <A onClick={() => trackEvent("Menu CTR", { props: { type: "search" } })} href={`/search${locale() == "zh-CN" ? "" : "-en"}/`} title="Search" class=":: h-menu flex items-center ">
                    <div class=":: i-carbon-search-advanced inline-block md:w-6 md:h-6 w-5 h-5  "></div>
                </A>
            </li>
            <li class=":: bg-menuHover trans-linear text-menuHover text-menu ">
                <a onClick={() => trackEvent("Menu CTR", { props: { type: "rss" } })} href="/atom.xml" target="_blank" title="RSS" class=":: h-menu flex items-center ">
                    <div class=":: i-carbon-rss inline-block md:w-6 md:h-6 w-5 h-5 "></div>
                </a>
            </li>
            <ToggleButton />
        </ul>
    )
}
export default Tools