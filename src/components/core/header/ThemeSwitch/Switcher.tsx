import { TbMoonStars, TbSettingsHeart, TbSunHigh, TbSunMoon } from 'solid-icons/tb';
import { Accessor, For, createSignal, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import { isBrowser } from "~/utils";
import { set, val } from "./Provider";

const ThemeMapping = [
    ["light", "浅色模式"],
    ["dark", "深色模式"],
    ["auto", "跟随系统"]
]

const Icons = [
    TbSunHigh,
    TbMoonStars,
    TbSettingsHeart
]

type ThemeMenuProps = {
    show: Accessor<boolean>,
    toggleShow: (e: MouseEvent) => void,
}


const ThemeMenu = ({ show, toggleShow }: ThemeMenuProps) => {
    const { LL } = useI18nContext()
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
                    (themeItem, idx) => {
                        const IconMod = Icons[idx()]
                        return (
                            <div onClick={(e) => handleClick(e, themeItem[0])} class={`:: cursor-pointer text-lg bg-menuHover p-4 gap-3 whitespace-nowrap flex items-center ${selected() == themeItem[0] ? 'text-menuActive' : ''}`}>
                                <IconMod class='w-6 h-6' stroke-width={1.5} />
                                <span>{LL().header.THEME[idx() as 0 | 1 | 2]()}</span>
                            </div>
                        )
                    }
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
                val.trackEvent("Menu CTR", { props: { type: "theme" } })
            }} title="Switch Theme" class={`:: text-menuHover h-menu flex items-center ${show() ? 'toggle-active' : ''}`}>
                <TbSunMoon class="md:w-6 md:h-6 w-5 h-5" stroke-width={1.5} />
            </button>
            <ThemeMenu show={show} toggleShow={toggleShow} />
        </li>
    )
}

export default ToggleButton;