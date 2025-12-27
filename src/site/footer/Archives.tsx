import { useI18nContext } from "~/i18n/i18n-solid";

const Archives = () => {
    const { LL } = useI18nContext();
    return (
        <div class="space-y-3">
            <label class="text-sm uppercase tracking-wide text-[var(--c-text-subtle)]">
                {LL && LL().footer.A()}
            </label>
            <div class="flex flex-col gap-2 text-sm leading-relaxed">
                {Object.entries(__CONTENT_POSTS_BY_YEAR)
                    .filter(([year]) => year !== "undefined")
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map((val) => (
                        <a
                            class="text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:underline hover:decoration-[var(--c-text)] decoration-1 underline-offset-4 transition-colors"
                            href={`/archives/#year-${val[0]}`}
                        >
                            {val[0]}（{val[1]}）
                        </a>
                    ))}
            </div>
        </div>
    );
};

export default Archives;
