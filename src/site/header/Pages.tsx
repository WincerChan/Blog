import { For, createMemo } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";

type PagesProps = {
    class?: string;
    onClick?: () => void;
};

const Pages = (props: PagesProps) => {
    const { locale } = useI18nContext();
    let pages = createMemo(() =>
        (locale() === "zh-CN" ? __CONTENT_ZH_NAV : __CONTENT_EN_NAV),
    );
    const itemClass =
        props.class ?? "text-[var(--c-text-muted)] hover:text-[var(--c-link)] transition-colors";
    return (
        <For each={pages()}>
            {(pageEntry) => (
                <a
                    href={`/${pageEntry.slug}/`}
                    class={itemClass}
                    onClick={() => props.onClick?.()}
                >
                    {pageEntry.title}
                </a>
            )}
        </For>
    );
};
export default Pages;
