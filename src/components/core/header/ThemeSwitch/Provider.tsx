import { createStore } from "solid-js/store";
import { isBrowser } from "~/utils";
const initialTheme = isBrowser ? localStorage.getItem("customer-theme") || "" : "";
const [theme, setTheme] = createStore({ theme: initialTheme });
export { theme, setTheme };
