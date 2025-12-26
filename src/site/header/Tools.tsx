import { useI18nContext } from "~/i18n/i18n-solid"
import IconRSS from "~icons/carbon/rss"
import IconSearch from "~icons/carbon/search-advanced"
import { ThemeSwitcher } from "~/features/theme"

const Tools = () => {
    const { locale } = useI18nContext()
    return (
        <ul class="">
            <li class="">
                <a href={`/search${locale() == "zh-CN" ? "" : "-en"}/`} title="Search" class="">
                    <IconSearch width={20} height={20} class="" />
                </a>
            </li>
            <li class="">
                <a href="/atom.xml" target="_blank" title="RSS" class="">
                    <IconRSS width={20} height={20} class="" />
                </a>
            </li>
            <ThemeSwitcher />
        </ul>
    )
}
export default Tools
