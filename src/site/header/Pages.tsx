import { For, createMemo } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";

const Pages = () => {
    const { locale } = useI18nContext();
    let pages = createMemo(() =>
        (locale() === "zh-CN" ? __CONTENT_ZH_NAV : __CONTENT_EN_NAV),
    );
    return (
        <For each={pages()}>
            {(pageEntry) => (
                <a
                    href={`/${pageEntry.slug}/`}
                    class=""
                >
                    {pageEntry.title}
                </a>
            )}
        </For>
    );
};
export default Pages;
