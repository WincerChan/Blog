import { Accessor, For, createSignal, onMount } from "solid-js";
import { setTheme, theme } from "./Provider";

const ThemeMapping = [
    ["light", "浅色模式"],
    ["dark", "深色模式"],
    ["", "跟随系统"]
]

const IconMapping: { [key: string]: string } = {
    "light": "i-carbon-haze",
    "dark": "i-carbon-haze-night",
    "": "i-carbon-settings"
}

type ThemeMenuProps = {
    show: Accessor<boolean>,
    toggleShow: (e: MouseEvent) => void,
}


const ThemeMenu = ({ show, toggleShow }: ThemeMenuProps) => {
    const handleClick = (e: MouseEvent, key: string) => {
        toggleShow(e)
        setTheme({ theme: key })
        localStorage.setItem("customer-theme", key)
    };


    onMount(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!!localStorage.getItem("customer-theme")) return
            const newColorScheme = e.matches ? 'dark' : '';
            setTheme({ theme: newColorScheme })
        })
    })

    return (
        <div class={`absolute shadow-round text-sm right-0 bg-ers z-1 mt-2 rounded overflow-hidden duration-200 transition-max-height ${show() ? "max-h-33" : "max-h-0"}`}>
            <For each={ThemeMapping}>
                {
                    themeItem => (
                        <div onClick={(e) => handleClick(e, themeItem[0])} class={`cursor-pointer bg-menuHover pr-3 py-2.5 whitespace-nowrap flex items-center ${theme.theme == themeItem[0] ? 'text-menuActive' : ''}`}>
                            <div class={`${IconMapping[themeItem[0]]} mx-2 w-5 h-5`}></div>
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
        <li ref={self!} class="bg-menuHover trans-linear relative">
            <button onClick={(e) => toggleShow(e)} title="Switch Theme" class={`h-full text-menuHover h-menu flex items-center ${show() ? 'toggle-active' : ''}`}>
                <i class="i-carbon-window-black-saturation w-6 h-6" />
            </button>
            <ThemeMenu show={show} toggleShow={toggleShow} />
        </li>
    )
}

export default ToggleButton;