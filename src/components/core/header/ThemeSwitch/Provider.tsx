import { createStore } from "solid-js/store";
import { isBrowser } from "~/utils";
let initialTheme
if (isBrowser) {
    const localVal = window.lt()
    const matches = window.mt();
    initialTheme = localVal || matches
}

const [val, set] = createStore({ theme: initialTheme });
export { val, set };
