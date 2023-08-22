import { Accessor, For, createSignal, onMount } from "solid-js";
import { isBrowser } from "~/utils";
import { trackEvent } from "~/utils/track";
import { set } from "./Provider";

const ThemeMapping = [
    ["light", "浅色模式"],
    ["dark", "深色模式"],
    ["auto", "跟随系统"]
]

const IconMapping: { [key: string]: string } = {
    "light": "i-carbon-haze",
    "dark": "i-carbon-haze-night",
    "auto": "i-carbon-settings"
}

type ThemeMenuProps = {
    show: Accessor<boolean>,
    toggleShow: (e: MouseEvent) => void,
}


const ThemeMenu = ({ show, toggleShow }: ThemeMenuProps) => {
    const [selected, setSelected] = createSignal(isBrowser ? window.lt() : "auto")
    const handleClick = (e: MouseEvent, key: string) => {
        toggleShow(e)
        setSelected(key)
        // 如果跟随系统，就需要先获取系统属于哪种模式
        // 要把系统的真实模式放在 theme 保存
        let systemMode = key;
        if (key === "")
            systemMode = window.mt();
        set({ theme: systemMode })
        localStorage.setItem("customer-theme", key)
    };


    onMount(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (selected() !== 'auto') return
            const newColorScheme = e.matches ? 'dark' : 'light';
            set({ theme: newColorScheme })
        })
    })


    return (
        <div class={`:: absolute shadow-round text-sm right-0 bg-ers z-20 mt-2 rounded overflow-hidden duration-200 transition-max-height ${show() ? "max-h-45" : "max-h-0"}`}>
            <For each={ThemeMapping}>
                {
                    themeItem => (
                        <div onClick={(e) => handleClick(e, themeItem[0])} class={`:: cursor-pointer text-lg bg-menuHover p-4 pl-0 whitespace-nowrap flex items-center ${selected() == themeItem[0] ? 'text-menuActive' : ''}`}>
                            <div class={`${IconMapping[themeItem[0]]} mx-3 w-6 h-6`}></div>
                            <span>{themeItem[1]}</span>
                        </div>
                    )
                }
            </For>
        </div>
    )
}

const ToggleButton = () => {
    const [show, setShow] = createSignal(false);
    const toggleShow = (e: MouseEvent) => {
        e.preventDefault()
        const curr = show()
        setShow(!curr)
        if (!curr) document.addEventListener("click", handleClickOutside)
        else document.removeEventListener("click", handleClickOutside)
    }
    let self: HTMLLIElement;

    const handleClickOutside = (e: MouseEvent) => {
        if (!self.contains(e.target as Node)) {
            toggleShow(e)
        }
    };
    return (
        <li ref={self!} class=":: bg-menuHover trans-linear relative">
            <button onClick={(e) => {
                toggleShow(e);
                trackEvent("Menu CTR", { props: { type: "theme" } })
            }} title="Switch Theme" class={`:: h-full text-menuHover h-menu flex items-center ${show() ? 'toggle-active' : ''}`}>
                <i class="i-carbon-window-black-saturation md:w-6 md:h-6 w-5 h-5" />
            </button>
            <ThemeMenu show={show} toggleShow={toggleShow} />
        </li>
    )
}

export default ToggleButton;