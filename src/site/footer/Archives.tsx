import { useI18nContext } from "~/i18n/i18n-solid";
import IconArrowRight from "~icons/ph/arrow-right";
import IconPointFilled from "~icons/ph/dot-outline-fill";

const Archives = () => {
    const { LL } = useI18nContext();
    const years = Object.entries(__CONTENT_POSTS_BY_YEAR)
        .filter(([year]) => year !== "undefined")
        .sort(([a], [b]) => Number(b) - Number(a));
    const displayedYears = years.slice(0, 5);
    const nextYear = years[5]?.[0];
    return (
        <div>
            <label class="text-sm uppercase tracking-wide text-[var(--c-text-subtle)] font-semibold">
                {LL && LL().footer.A()}
            </label>
            <div class="flex flex-col mt-3 gap-2 text-sm leading-relaxed">
                {displayedYears.map((val) => (
                    <a
                        class="group inline-flex items-center gap-1 text-[var(--c-text-muted)] transition-colors"
                        href={`/archives/#year-${val[0]}`}
                    >
                        <span class="group-hover:text-[var(--c-text)] group-hover:underline group-hover:decoration-[var(--c-text)] decoration-1 underline-offset-4">
                            {val[0]}
                        </span>
                        <IconPointFilled width={12} height={12} class="text-[var(--c-text-subtle)]" />
                        <span class="text-[var(--c-text)] font-medium tabular-nums">{val[1]}</span>
                    </a>
                ))}
                <a
                    class="group inline-flex items-center gap-1 text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:underline hover:decoration-[var(--c-text)] decoration-1 underline-offset-4 transition-colors"
                    href={nextYear ? `/archives/#year-${nextYear}` : "/archives/"}
                >
                    更多年份
                    <IconArrowRight width={14} height={14} class="transition-transform group-hover:translate-x-1" />
                </a>
            </div>
        </div>
    );
};

export default Archives;
