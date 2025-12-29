import { Show, createMemo } from "solid-js";
import IconTranslate from "~icons/ph/translate";
import { useI18nContext } from "~/i18n/i18n-solid";

interface TranslateProps {
    lang?: string,
    pageURL: string
}

const Translate = ({ pageURL, lang }: TranslateProps) => {
    const { LL } = useI18nContext();
    const normalizeUrl = (value: string) => (value.endsWith("/") ? value : `${value}/`);
    const getSlugInfo = (url: string) => {
        const normalized = normalizeUrl(url);
        const isPost = normalized.startsWith("/posts/");
        const slug = isPost
            ? normalized.slice("/posts/".length, -1)
            : normalized.slice(1, -1);
        return { isPost, slug, normalized };
    };

    const derived = createMemo(() => {
        if (!lang || !pageURL) {
            return null;
        }
        const langShort = String(lang).split("-")[0] || "";
        if (!langShort) return null;

        const { isPost, slug, normalized } = getSlugInfo(pageURL);
        if (!slug) return null;

        const targetLangShort = langShort === "zh" ? "en" : "zh";
        const targetSlug = slug.endsWith(`-${langShort}`)
            ? slug.replace(new RegExp(`-${langShort}$`), "")
            : `${slug}-${targetLangShort}`;
        if (!targetSlug || targetSlug === slug) return null;

        const targetUrl = isPost ? `/posts/${targetSlug}/` : `/${targetSlug}/`;
        const targetLocale = langShort === "zh" ? "en" : "zh-CN";
        const targetName = targetLocale === "en" ? "EN" : "中文";
        return {
            targetLocale,
            targetName,
            targetUrl,
        };
    });

    return (
        <Show when={derived()}>
            {(info) => (
                <a
                    href={info().targetUrl}
                    lang={info().targetLocale}
                    link={true}
                    title={LL().post.SWITCH_TO()}
                    aria-label={LL().post.SWITCH_TO()}
                    class="inline-flex items-center gap-1.5 text-sm font-sans normal-case tracking-normal text-[var(--c-text-subtle)] transition-colors hover:text-[var(--c-link)]"
                >
                    <IconTranslate class="block" width={16} height={16} />
                    {info().targetName}
                </a>
            )}
        </Show>
    );
}

export default Translate
