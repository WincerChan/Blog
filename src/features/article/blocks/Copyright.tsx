import { formatDate } from "~/utils";

interface CopyrightProps {
    updated: Date
}

const Copyright = ({ updated }: CopyrightProps) => {
    return (
        <div class="mt-12 mx-[-1rem] p-5 border border-dashed border-[var(--c-border)] rounded-none text-sm md:mx-0 md:rounded">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div class=" font-mono">
                    <div class=" font-bold text-sm">
                        <span>Wincer</span>
                    </div>
                    <div class=" flex gap-2 mt-1 text-[var(--c-text-muted)]">
                        <a
                            href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh"
                            class="text-[var(--c-text-muted)] underline decoration-1 underline-offset-4 decoration-[var(--c-border-strong)] hover:text-[var(--c-text)] hover:decoration-[var(--c-text)] transition-colors"
                            target="_blank"
                            rel="noopener"
                        >
                            CC BY-NC-ND 4.0
                        </a>
                        <span class="text-[var(--c-text-subtle)]">/</span>
                        <span class="font-sans">转载请注明出处</span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="opacity-60">更新于</div>
                    <div class="tabular-nums mt-1 font-mono text-[var(--c-text-subtle)]">2023-10-25 14:20:00</div>
                </div>
            </div>
        </div>
    )
}

export default Copyright;
