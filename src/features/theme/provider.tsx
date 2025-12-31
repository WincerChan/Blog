import { createStore } from "solid-js/store";
import { isBrowser } from "~/utils";
import { getInitialTheme, type ThemeValue } from "./theme";

type GlobalStore = {
    theme: ThemeValue;
    locale: string;
    trackPage: (pathname?: string) => void;
    trackEngage: (useBeacon?: boolean) => void;
};

const initialStore: GlobalStore = {
    theme: getInitialTheme(),
    locale: isBrowser ? document.documentElement.lang || "zh-CN" : "zh-CN",
    trackPage: () => undefined,
    trackEngage: () => undefined,
};

const [globalStore, setGlobalStore] = createStore<GlobalStore>(initialStore);

export { globalStore, setGlobalStore };
