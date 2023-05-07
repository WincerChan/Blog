import { createStore } from "solid-js/store";
import { isBrowser } from "~/utils";
const [val, set] = createStore({ theme: isBrowser ? document.documentElement.className : "auto" });
export { val, set };
