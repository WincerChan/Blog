import { useI18nContext } from "~/i18n/i18n-solid";

const Archives = () => {
    const { LL } = useI18nContext();
    return (
        <div class="">
            <label class="">
                {LL && LL().footer.A()}
            </label>
            <div class="">
                {Object.entries(__CONTENT_POSTS_BY_YEAR)
                    .filter(([year]) => year !== "undefined")
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map((val) => (
                        <a
                            class=""
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
