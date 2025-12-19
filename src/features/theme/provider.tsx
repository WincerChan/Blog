import { createStore } from "solid-js/store";
import { isBrowser } from "~/utils";
import { getInitialTheme, type ThemeValue } from "./theme";

type TrackEvent = (name: string, payload?: Record<string, unknown>) => void;

type GlobalStore = {
    theme: ThemeValue;
    locale: string;
    trackEvent: TrackEvent;
    trackPage: () => void;
};

const initialStore: GlobalStore = {
    theme: getInitialTheme(),
    locale: isBrowser ? document.documentElement.lang || "zh-CN" : "zh-CN",
    trackEvent: () => undefined,
    trackPage: () => undefined,
};

const [globalStore, setGlobalStore] = createStore<GlobalStore>(initialStore);

export { globalStore, setGlobalStore };
