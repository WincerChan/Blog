import { createSignal } from "solid-js";
import { getInitialTheme, type ThemeValue } from "./theme";

const [theme, setTheme] = createSignal<ThemeValue>(getInitialTheme());

export { theme, setTheme };
