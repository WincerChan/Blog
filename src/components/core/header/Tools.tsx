import { TbCloudSearch, TbRss } from "solid-icons/tb"
import { A } from "solid-start"
import { useI18nContext } from "~/i18n/i18n-solid"
import { val } from "./ThemeSwitch/Provider"
import ToggleButton from "./ThemeSwitch/Switcher"

const Tools = () => {
    const { locale } = useI18nContext()
    return (
        <ul class="flex">
            <li class=":: bg-menuHover trans-linear text-menuHover text-menu ">
                <A onClick={() => val.trackEvent("Menu CTR", { props: { type: "search" } })} href={`/search${locale() == "zh-CN" ? "" : "-en"}/`} title="Search" class=":: h-menu flex items-center ">
                    <TbCloudSearch class="md:w-6 md:h-6 w-5 h-5" stroke-width={1.5} />
                </A>
            </li>
            <li class=":: bg-menuHover trans-linear text-menuHover text-menu ">
                <a onClick={() => val.trackEvent("Menu CTR", { props: { type: "rss" } })} href="/atom.xml" target="_blank" title="RSS" class=":: h-menu flex items-center ">
                    <TbRss class="md:w-6 md:h-6 w-5 h-5" stroke-width={1.5} />
                </a>
            </li>
            <ToggleButton />
        </ul>
    )
}
export default Tools