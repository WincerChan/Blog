import { For, createMemo } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconArrowRight from "~icons/ph/arrow-right";

type PagesProps = {
    class?: string;
    onClick?: () => void;
    showSuffixIcon?: boolean;
    iconClass?: string;
};

const Pages = (props: PagesProps) => {
    const { locale } = useI18nContext();
    let pages = createMemo(() =>
        (locale() === "zh-CN" ? __CONTENT_ZH_NAV : __CONTENT_EN_NAV),
    );
    const itemClass =
        props.class ?? "text-[var(--c-text-muted)] hover:text-[var(--c-link)] transition-colors";
    const iconClass =
        props.iconClass ?? "text-[var(--c-text-subtle)] transition-colors group-hover:text-[var(--c-link)]";
    return (
        <For each={pages()}>
            {(pageEntry) => (
                <a
                    href={`/${pageEntry.slug}/`}
                    class={itemClass}
                    onClick={() => props.onClick?.()}
                >
                    {pageEntry.title}
                    {props.showSuffixIcon && (
                        <IconArrowRight width={18} height={18} class={iconClass} />
                    )}
                </a>
            )}
        </For>
    );
};
export default Pages;
