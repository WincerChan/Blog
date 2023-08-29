import { A } from "@solidjs/router";
import { Accessor, createSignal, onMount } from "solid-js";
import { Translations } from "~/i18n/i18n-types";
import IconTranslate from "~icons/carbon/translate";
import { val } from "../../header/ThemeSwitch/Provider";

interface TranslateProps {
    LL: Accessor<Translations>,
    lang?: string,
    pageURL: string
}

const Translate = ({ LL, pageURL, lang }: TranslateProps) => {
    const [toggle, setToggle] = createSignal(false)
    const [aviableLangs, setAviableLangs] = createSignal({})
    const click = () => {
        setToggle(!toggle())
    }

    onMount(() => {
        let translateURL;
        let langShort = lang?.split("-")[0]
        let translateLangShort = langShort == "zh" ? "en" : "zh"
        if (pageURL.endsWith(`-${langShort}/`)) {
            translateURL = pageURL.replace(`-${langShort}`, ``)
        } else {
            translateURL = pageURL.slice(0, -1) + `-${translateLangShort}/`
        }
        setAviableLangs({
            "en": { name: "English", url: langShort == "zh" ? translateURL : pageURL },
            "zh-CN": { name: "中文", url: langShort == "zh" ? pageURL : translateURL }
        })
    })

    const onblur = () => {
        setTimeout(() => {
            setToggle(false)
        }, 100)
    }

    return (
        <button onClick={click} onBlur={onblur} title="Translate" class={`:: hover:text-indigo-500 focus:text-indigo-500 relative trans-linear h-15 w-24 animate-shake-y`}>
            <IconTranslate height={36} width={36} />
            <div class={`:: absolute font-bold text-lg bg-ers shadow-round rounded-lg left-0 right-0 mx-auto flex flex-col text-subtitle bottom-16 duration-200 transition-max-height lg:w-24 overflow-hidden ${toggle() ? 'max-h-24' : 'max-h-0'}`}>
                {
                    Object.entries(aviableLangs()).map(([key, name]) => (
                        <A href={name.url} activeClass="" inactiveClass="" class={` my-2 ${val.lang == key ? 'text-menuActive' : ''}`} title={val.lang == key ? `Current: ${name.name}` : name.name}>{name.name}</A>
                    ))
                }
            </div>
        </button>
    )
}

export default Translate