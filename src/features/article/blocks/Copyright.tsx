import { formatDate } from "~/utils";

interface CopyrightProps {
    updated: Date
}

const Copyright = ({ updated }: CopyrightProps) => {
    return (
        <div class="mt-12 p-5 border border-dashed border-[var(--c-border)] rounded text-sm font-mono ">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2 font-bold text-sm">
                        <span>Wincer</span>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                        <a
                            href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh"
                            class="underline decoration-[var(--c-border-strong)] underline-offset-4 transition-colors hover:text-[var(--c-text)] hover:decoration-[var(--c-text)]"
                            target="_blank"
                            rel="noopener"
                        >
                            CC BY-NC-ND 4.0
                        </a>
                        <span class="text-[var(--c-text-subtle)]">/</span>
                        <span>转载请注明出处</span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="opacity-60">更新于：</div>
                    <div class="tabular-nums text-[var(--c-text-subtle)]">2023-10-25 14:20:00</div>
                </div>
            </div>
        </div>
    )
}

export default Copyright;
