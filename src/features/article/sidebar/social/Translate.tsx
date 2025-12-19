import { Show, createSignal, onMount } from "solid-js";
import IconTranslate from "~icons/carbon/translate";
import { globalStore } from "~/features/theme";
import { safeEncode } from "~/content/velite-utils";

interface TranslateProps {
    lang?: string,
    pageURL: string
}

const Translate = ({ pageURL, lang }: TranslateProps) => {
    const [toggle, setToggle] = createSignal(false);
    const [availableLangs, setAvailableLangs] = createSignal<
        Record<string, { name: string; url: string }>
    >({});
    const [hasTranslation, setHasTranslation] = createSignal(false);
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

    onMount(() => {
        if (!lang || !pageURL) return;
        const langShort = String(lang).split("-")[0] || "";
        if (!langShort) return;

        const { isPost, slug, normalized } = getSlugInfo(pageURL);
        if (!slug) return;

        const targetLangShort = langShort === "zh" ? "en" : "zh";
        const targetSlug = slug.endsWith(`-${langShort}`)
            ? slug.replace(new RegExp(`-${langShort}$`), "")
            : `${slug}-${targetLangShort}`;
        if (!targetSlug || targetSlug === slug) return;

        const targetUrl = isPost ? `/posts/${targetSlug}/` : `/${targetSlug}/`;
        const dataBase = isPost ? "/_data/posts/" : "/_data/pages/";
        const targetDataUrl = `${dataBase}${safeEncode(targetSlug)}.json`;

        fetch(targetDataUrl)
            .then((res) => res.ok)
            .then((exists) => {
                if (!exists) {
                    setHasTranslation(false);
                    return;
                }
                setAvailableLangs({
                    en: { name: "English", url: langShort === "zh" ? targetUrl : normalized },
                    "zh-CN": { name: "中文", url: langShort === "zh" ? normalized : targetUrl },
                });
                setHasTranslation(true);
            })
            .catch(() => setHasTranslation(false));
    });

    const onblur = () => {
        setTimeout(() => {
            setToggle(false)
        }, 100)
    }


    return (
        <Show when={hasTranslation()}>
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
                    {Object.entries(availableLangs()).map(([key, name]) => (
                        <a
                            lang={key}
                            href={name.url}
                            class={` my-2 ${globalStore.locale == key ? 'text-menu-active' : ''}`}
                            title={globalStore.locale == key ? `Current: ${name.name}` : name.name}
                        >
                            {name.name}
                        </a>
                    ))}
                </div>
            </button>
        </Show>
    );
}

export default Translate
