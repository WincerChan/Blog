import { useI18nContext } from "~/i18n/i18n-solid";

const Archives = () => {
    const { LL } = useI18nContext();
    return (
        <div class="">
            <label class=":: text-[15px]  font-headline text-[var(--subtitle)]">
                {LL && LL().footer.A()}
            </label>
            <div class=":: mb-6 md:w-48 text-[var(--extra)] md:grid grid-flow-row grid-cols-2 gap-x-4 ">
                {Object.entries(__POSTS_BY_YEAR)
                    .filter(([year]) => year !== "undefined")
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map((val) => (
                        <a
                            class=":: hover:text-menu-accent block "
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
