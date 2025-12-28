import { Accessor, For, createSignal, onCleanup, onMount } from "solid-js";
import { useI18nContext } from "~/i18n/i18n-solid";
import IconSun from "~icons/ph/sun";
import IconMoon from "~icons/ph/moon";
import IconContrast from "~icons/ph/circle-half";
import IconAutomation from "~icons/ph/gear";

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
    IconSun,
    IconMoon,
    IconAutomation
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
        <div
            class="absolute right-0 top-full mt-2 w-32 rounded-md border border-[var(--c-border)] bg-[var(--c-surface)] text-sm shadow-sm overflow-hidden transition duration-150"
            classList={{
                "opacity-0 pointer-events-none translate-y-1": !show(),
                "opacity-100 translate-y-0": show(),
            }}
        >
            <For each={ThemeMapping}>
                {
                    (themeItem, idx) => {
                        const IconMod = Icons[idx()]
                        return (
                            <div
                                onClick={(e) => handleClick(e, themeItem[0])}
                                class="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-[var(--c-hover-bg)] transition-colors"
                                classList={{
                                    "text-[var(--c-text)]": selected() !== themeItem[0],
                                    "text-[var(--c-accent)] font-medium":
                                        selected() === themeItem[0],
                                }}
                            >
                                <IconMod width={20} height={20} />
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
    let self: HTMLDivElement;

    const handleClickOutside = (e: MouseEvent) => {
        if (!self.contains(e.target as Node)) {
            toggleShow(e)
        }
    };
    return (
        <div ref={self!} class="relative">
            <button onClick={(e) => {
                e.preventDefault()
                toggleShow(e);
            }} title="Switch Theme" class="flex items-center justify-center w-[22px] h-[22px] text-[var(--c-text-muted)] hover:text-[var(--c-link)] transition-colors">
                {/* Inline icon sizing can expand the wrapper; pin a fixed square button. */}
                <IconContrast class="block w-[22px] h-[22px] transition-colors" />
            </button>
            <ThemeMenu show={show} toggleShow={toggleShow} />
        </div>
    );
}

export default ToggleButton;
