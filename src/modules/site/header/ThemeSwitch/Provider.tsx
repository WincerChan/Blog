import { createStore } from "solid-js/store";
import { isBrowser } from "~/utils";
const [globalStore, setGlobalStore] = createStore({ theme: isBrowser ? document.documentElement.className : "auto", "locale": isBrowser ? document.documentElement.lang : "zh-CN", "trackEvent": (arg0: string, arg1: {}) => { }, "trackPage": () => { } });
export { globalStore, setGlobalStore };
