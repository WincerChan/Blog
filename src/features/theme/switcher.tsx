import { Accessor, For, createSignal, onCleanup, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconHaze from "~icons/carbon/haze";
import IconHazeNight from "~icons/carbon/haze-night";
import IconWindowSwitcher from "~icons/carbon/window-black-saturation";
import IconWorkflowAuto from "~icons/carbon/workflow-automation";

import { setGlobalStore } from "./provider";
import {
    getStoredThemePreference,
    getSystemTheme,
    resolveTheme,
    setStoredThemePreference,
    type ThemePreference,
} from "./theme";

const ThemeMapping: Array<[ThemePreference, string]> = [
    ["light", "浅色模式"],
    ["dark", "深色模式"],
    ["auto", "跟随系统"],
];

const Icons = [
    IconHaze,
    IconHazeNight,
    IconWorkflowAuto
];

type ThemeMenuProps = {
    show: Accessor<boolean>,
    toggleShow: (e: MouseEvent) => void,
}


const ThemeMenu = ({ show, toggleShow }: ThemeMenuProps) => {
    const { LL } = useI18nContext()
    const [selected, setSelected] = createSignal<ThemePreference>("auto");
    const handleClick = (e: MouseEvent, key: ThemePreference) => {
        toggleShow(e)
        setSelected(key);
        setGlobalStore({ theme: resolveTheme(key) })
        setStoredThemePreference(key);
    };


    onMount(() => {
        setSelected(getStoredThemePreference());
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (selected() !== 'auto') return
            setGlobalStore({ theme: getSystemTheme() })
        };
        media.addEventListener('change', handleChange);
        onCleanup(() => media.removeEventListener('change', handleChange));
    })


    return (
        <div class="">
            <For each={ThemeMapping}>
                {
                    (themeItem, idx) => {
                        const IconMod = Icons[idx()]
                        return (
                            <div onClick={(e) => handleClick(e, themeItem[0])} class="">
                                <IconMod width={24} height={24} />
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
        <li ref={self!} class="">
            <button onClick={(e) => {
                e.preventDefault()
                toggleShow(e);
            }} title="Switch Theme" class="">
                <IconWindowSwitcher width={20} height={20} class="" />
            </button>
            <ThemeMenu show={show} toggleShow={toggleShow} />
        </li>
    )
}

export default ToggleButton;
