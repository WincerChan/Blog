import { createStore } from "solid-js/store";
import { isBrowser } from "~/utils";
const [val, set] = createStore({ theme: isBrowser ? document.documentElement.className : "auto", "modal": false, "lang": "zh-CN", "trackEvent": (arg0: string, arg1: {}) => { } });
export { set, val };

