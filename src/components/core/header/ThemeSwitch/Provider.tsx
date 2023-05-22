import { createStore } from "solid-js/store";
import { isBrowser } from "~/utils";
const [val, set] = createStore({ theme: isBrowser ? document.documentElement.className : "auto", "sw-notify": false });
export { val, set };
