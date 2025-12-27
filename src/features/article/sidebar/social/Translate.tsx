import { Show, createMemo, createSignal } from "solid-js";
import IconTranslate from "~icons/tabler/language";
import { globalStore } from "~/features/theme";
import { safeEncode } from "~/content/velite-utils";

interface TranslateProps {
    lang?: string,
    pageURL: string
}

const Translate = ({ pageURL, lang }: TranslateProps) => {
    const [toggle, setToggle] = createSignal(false);
    const click = () => {
        setToggle(!toggle());
    };

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
        const dataBase = isPost ? "/_data/posts/" : "/_data/pages/";
        const langMap: Record<string, { name: string; url: string }> = {
            en: { name: "English", url: langShort === "zh" ? targetUrl : normalized },
            "zh-CN": { name: "中文", url: langShort === "zh" ? normalized : targetUrl },
        };
        return { langMap };
    });

    const onblur = () => {
        setTimeout(() => {
            setToggle(false)
        }, 100)
    }

    return (
        <Show when={derived()}>
            {(info) => (
                <button
                    onClick={click}
                    onBlur={onblur}
                    title="Translate"
                    class="relative inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-text)]"
                    aria-expanded={toggle()}
                >
                    <IconTranslate class="block" height={24} width={24} />
                    <div
                        class="absolute left-0 top-full mt-2 min-w-[140px] rounded-md border border-[var(--c-border)] bg-[var(--c-surface)] py-1 text-sm shadow-sm transition duration-150"
                        classList={{
                            "opacity-0 pointer-events-none translate-y-1": !toggle(),
                            "opacity-100 translate-y-0": toggle(),
                        }}
                    >
                        {Object.entries(info().langMap).map(([key, entry]) => (
                            <a
                                lang={key}
                                href={entry.url}
                                link={true}
                                class="block px-3 py-1.5 text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-text)]"
                                title={globalStore.locale == key ? `Current: ${entry.name}` : entry.name}
                            >
                                {entry.name}
                            </a>
                        ))}
                    </div>
                </button>
            )}
        </Show>
    );
}

export default Translate
