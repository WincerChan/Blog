import { createSignal } from "solid-js";
import { setTheme } from "./Provider";

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
    switchMode: (mode: string) => void,
    show: boolean,
    setShow: (show: boolean) => void,
    currTheme: string | null
}


const ThemeMenu = ({ show, setShow, currTheme }: ThemeMenuProps) => {
    const handleClick = (key: string) => {
        setShow(!show);
        setTheme({ theme: key })
    };

    return (
        <div class={`absolute shadow-round text-sm right-0 bg-ers z-1 mt-2 rounded overflow-hidden duration-200 transition-max-height ${show() ? "max-h-33" : "max-h-0"}`}>
            {
                ThemeMapping.map((theme) => (
                    <div onClick={() => handleClick(theme[0])} class={`cursor-pointer bg-menuHover pr-3 py-2.5 whitespace-nowrap flex items-center ${currTheme == theme[0] ? 'text-menuActive' : ''}`}>
                        <div class={`${IconMapping[theme[0]]} mx-2 w-5 h-5`}></div>
                        <span>{theme[1]}</span>
                        <span>{theme[0] === currTheme}</span>
                    </div>
                ))
            }
        </div>
    )
}

const ToggleButton = () => {
    const [show, setShow] = createSignal(false);
    return (
        <li onClick={() => { setShow(!show()) }} class="bg-menuHover trans-linear relative">
            <button title="Switch Theme" class={`h-full text-menuHover h-menu flex items-center ${show() ? 'toggle-active' : ''}`}>
                <i class="i-carbon-window-black-saturation w-6 h-6" />
            </button>
            <ThemeMenu show={show} setShow={setShow} />
        </li>
    )
}

export default ToggleButton;