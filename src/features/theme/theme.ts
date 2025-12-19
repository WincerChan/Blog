import { isBrowser } from "~/utils";

type ThemePreference = "light" | "dark" | "auto";
type ThemeValue = "light" | "dark";

const THEME_STORAGE_KEY = "customer-theme";

const getStoredThemePreference = (): ThemePreference => {
    if (!isBrowser) return "auto";
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "auto") return value;
    return "auto";
};

const setStoredThemePreference = (preference: ThemePreference) => {
    if (!isBrowser) return;
    localStorage.setItem(THEME_STORAGE_KEY, preference);
};

const getSystemTheme = (): ThemeValue =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const resolveTheme = (preference: ThemePreference): ThemeValue =>
    preference === "auto" ? getSystemTheme() : preference;

const getDocumentTheme = (): ThemeValue | null => {
    if (!isBrowser) return null;
    const value = document.documentElement.className;
    return value === "light" || value === "dark" ? value : null;
};

const getInitialTheme = (): ThemeValue => {
    if (!isBrowser) return "light";
    return getDocumentTheme() ?? resolveTheme(getStoredThemePreference());
};

const applyTheme = (value: ThemeValue) => {
    if (!isBrowser) return;
    document.documentElement.setAttribute("class", value);
};

const themeInitScript =
    `!function(){` +
    `var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'auto';` +
    `var s=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';` +
    `var v=t==='auto'?s:t;` +
    `document.documentElement.setAttribute('class', v);` +
    `}();`;

export {
    THEME_STORAGE_KEY,
    applyTheme,
    getDocumentTheme,
    getInitialTheme,
    getStoredThemePreference,
    getSystemTheme,
    resolveTheme,
    setStoredThemePreference,
    themeInitScript,
};

export type { ThemePreference, ThemeValue };
