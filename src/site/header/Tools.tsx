import { useI18nContext } from "~/i18n/i18n-solid"
import IconRSS from "~icons/tabler/rss"
import IconSearch from "~icons/tabler/search"
import { ThemeSwitcher } from "~/features/theme"

const Tools = () => {
    const { locale } = useI18nContext()
    return (
        <div class="flex items-center gap-6 border-l border-[var(--c-border)] pl-4">
            <a
                href={`/search${locale() == "zh-CN" ? "" : "-en"}/`}
                title="Search"
                class="inline-flex items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-link)] transition-colors"
            >
                <IconSearch width={22} height={22} class="block transition-colors" />
            </a>
            <a
                href="/atom.xml"
                target="_blank"
                title="RSS"
                class="hidden md:inline-flex items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-link)] transition-colors"
            >
                <IconRSS width={22} height={22} class="block transition-colors" />
            </a>
            <ThemeSwitcher />
        </div>
    );
}
export default Tools
