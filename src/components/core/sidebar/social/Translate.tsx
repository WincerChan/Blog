import { A } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { val } from "../../header/ThemeSwitch/Provider";

interface TranslateProps {
    lang?: string,
    pageURL: string
}

const Translate = ({ lang, pageURL }: TranslateProps) => {
    const [clicked, setClicked] = createSignal(false)
    const [toggle, setToggle] = createSignal(false)
    const [aviableLangs, setAviableLangs] = createSignal({})
    const click = () => {
        setToggle(!toggle())
    }

    onMount(() => {
        const enURL = pageURL.replace("-zh/", "-en/?lang=en")
        const zhURL = pageURL.replace("-en/", "-zh/?lang=zh-CN")
        setAviableLangs({
            "en": { name: "English", url: enURL },
            "zh-CN": { name: "中文", url: zhURL }
        })
    })

    const onblur = () => {
        setTimeout(() => {
            setToggle(false)
        }, 100)
    }

    return (
        <button onClick={click} onBlur={onblur} onMouseOver={() => setClicked(true)} title="Translate" class={`:: hover:text-indigo-500 focus:text-indigo-500 relative trans-linear h-15 lg:w-12 animate-shake-y`}>
            <i class=":: i-carbon-translate w-9 h-9 " />
            <div class={`:: absolute font-bold text-lg bg-ers shadow-round rounded-lg left-0 lg:-left-6 right-0 mx-auto flex flex-col text-subtitle bottom-16 duration-200 transition-max-height lg:w-24 overflow-hidden ${toggle() ? 'max-h-24' : 'max-h-0'}`}>
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