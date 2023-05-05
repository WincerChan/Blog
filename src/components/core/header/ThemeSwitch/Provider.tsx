import { createStore } from "solid-js/store";
import { isBrowser } from "~/utils";
let initialTheme
if (isBrowser) {
    const localVal = localStorage.getItem("customer-theme")
    const mathes = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : '';
    initialTheme = localVal || mathes
}

const [val, set] = createStore({ theme: initialTheme });
export { val, set };
