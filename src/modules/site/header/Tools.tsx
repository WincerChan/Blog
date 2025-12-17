import { useI18nContext } from "~/i18n/i18n-solid"
import IconRSS from "~icons/carbon/rss"
import IconSearch from "~icons/carbon/search-advanced"
import { globalStore } from "./ThemeSwitch/Provider"
import ToggleButton from "./ThemeSwitch/Switcher"

const Tools = () => {
    const { locale } = useI18nContext()
    return (
        <ul class="flex">
            <li class="menu-hover-transition">
                <a onClick={() => globalStore.trackEvent("Menu CTR", { props: { type: "search" } })} href={`/search${locale() == "zh-CN" ? "" : "-en"}/`} title="Search" class=":: h-full px-3 sm:px[14px] lg:px-6 flex items-center ">
                    <IconSearch width={20} height={20} class=":: md:w-6 md:h-6 " />
                </a>
            </li>
            <li class="menu-hover-transition">
                <a onClick={() => globalStore.trackEvent("Menu CTR", { props: { type: "rss" } })} href="/atom.xml" target="_blank" title="RSS" class=":: h-full px-3 sm:px[14px] lg:px-6 flex items-center ">
                    <IconRSS width={20} height={20} class=":: md:w-6 md:h-6 " />
                </a>
            </li>
            <ToggleButton />
        </ul>
    )
}
export default Tools
