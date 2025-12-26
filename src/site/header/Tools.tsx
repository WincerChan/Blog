import { useI18nContext } from "~/i18n/i18n-solid"
import IconRSS from "~icons/carbon/rss"
import IconSearch from "~icons/carbon/search-advanced"
import { ThemeSwitcher } from "~/features/theme"

const Tools = () => {
    const { locale } = useI18nContext()
    return (
        <div class="flex items-center gap-1 border-l border-[var(--c-border)] pl-4">
            <a
                href={`/search${locale() == "zh-CN" ? "" : "-en"}/`}
                title="Search"
                class="inline-flex items-center justify-center rounded-md p-2 text-[var(--c-text-muted)] hover:text-[var(--c-link)] hover:bg-[var(--c-hover-bg)] transition-colors"
            >
                <IconSearch width={20} height={20} class="transition-colors" />
            </a>
            <a
                href="/atom.xml"
                target="_blank"
                title="RSS"
                class="inline-flex items-center justify-center rounded-md p-2 text-[var(--c-text-muted)] hover:text-[var(--c-link)] hover:bg-[var(--c-hover-bg)] transition-colors"
            >
                <IconRSS width={20} height={20} class="transition-colors" />
            </a>
            <ThemeSwitcher />
        </div>
    );
}
export default Tools
