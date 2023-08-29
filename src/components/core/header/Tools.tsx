import { isServer } from "solid-js/web"
import { A } from "solid-start"
import { useI18nContext } from "~/i18n/i18n-solid"
import IconRSS from "~icons/carbon/rss"
import IconSearch from "~icons/carbon/search-advanced"
import { val } from "./ThemeSwitch/Provider"
import ToggleButton from "./ThemeSwitch/Switcher"

const Tools = () => {
    const { locale } = useI18nContext()
    return (
        <ul class="flex">
            {isServer &&
                <>
                    <li class=":: bg-menuHover trans-linear text-menuHover text-menu ">
                        <A onClick={() => val.trackEvent("Menu CTR", { props: { type: "search" } })} href={`/search${locale() == "zh-CN" ? "" : "-en"}/`} title="Search" class=":: h-menu flex items-center ">
                            <IconSearch width={20} height={20} class=":: md:w-6 md:h-6 " />
                        </A>
                    </li>
                    <li class=":: bg-menuHover trans-linear text-menuHover text-menu ">
                        <a onClick={() => val.trackEvent("Menu CTR", { props: { type: "rss" } })} href="/atom.xml" target="_blank" title="RSS" class=":: h-menu flex items-center ">
                            <IconRSS width={20} height={20} class=":: md:w-6 md:h-6 " />
                        </a>
                    </li>
                </>
            }
            <ToggleButton />
        </ul>
    )
}
export default Tools