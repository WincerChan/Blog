import { Show, createMemo, createSignal } from "solid-js";
import IconTranslate from "~icons/carbon/translate";
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
                    class={`:: hover:text-indigo-500 focus:text-indigo-500 relative transition-linear h-15 w-24 animate-shake-y`}
                >
                    <IconTranslate class=":: mx-auto " height={36} width={36} />
                    <div
                        class={`:: absolute font-bold text-lg bg-surface shadow-card rounded-lg left-0 right-0 mx-auto flex flex-col text-[var(--subtitle)] bottom-16 duration-200 transition-max-height lg:w-24 overflow-hidden ${toggle() ? 'max-h-24' : 'max-h-0'}`}
                    >
                        {Object.entries(info().langMap).map(([key, entry]) => (
                            <a
                                lang={key}
                                href={entry.url}
                                link={true}
                                class={` my-2 ${globalStore.locale == key ? 'text-menu-active' : ''}`}
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
