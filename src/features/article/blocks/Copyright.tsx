import { formatDate } from "~/utils";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconArrowUpRight from "~icons/ph/arrow-up-right";

interface CopyrightProps {
    updated: Date
}

const Copyright = ({ updated }: CopyrightProps) => {
    const { LL } = useI18nContext();
    const labels = () => LL && LL().post.COPYRIGHT;
    return (
        <div class="mt-0 mx-[-1rem] border-b border-dashed border-[var(--c-border)] py-6 px-4 text-sm md:mx-0 md:px-0">
            <div class="flex flex-wrap items-center gap-3 md:flex-nowrap md:justify-between md:gap-6">
                <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div class="inline-flex items-baseline gap-2 md:whitespace-nowrap">
                        <span class="text-[var(--c-text-subtle)]">
                            {labels()?.[0]?.()}
                        </span>
                        <span class="font-mono text-[var(--c-text)]">Wincer</span>
                    </div>
                    <div class="inline-flex items-baseline gap-2 md:whitespace-nowrap">
                        <span class="text-[var(--c-text-subtle)]">
                            {labels()?.[1]?.()}
                        </span>
                        <span class="font-mono tabular-nums text-[var(--c-text)]">2023-10-25 14:20:00</span>
                    </div>
                </div>
                <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 md:flex-nowrap md:whitespace-nowrap">
                    <span class="text-[var(--c-text-subtle)]">
                        {labels()?.[2]?.()}
                    </span>
                    <a
                        href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh"
                        class="group inline-flex items-center gap-1 font-mono text-[var(--c-text-muted)] underline decoration-1 underline-offset-4 decoration-[var(--c-border-strong)] transition-colors hover:text-[var(--c-text)] hover:decoration-[var(--c-text)]"
                        target="_blank"
                        rel="noopener"
                    >
                        CC BY-NC-ND 4.0
                        <IconArrowUpRight class="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Copyright;
