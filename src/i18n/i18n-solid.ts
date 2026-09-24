// Solid 2 adapter. The generated dictionaries and formatters remain framework-neutral.
import { createComponent, createContext, createMemo, createSignal, useContext, untrack } from "solid-js";
import type { Accessor, ParentProps, Setter } from "solid-js";
import type { Locales, TranslationFunctions } from "./i18n-types";
import { i18nObject } from "./i18n-util";
import { loadLocale } from "./i18n-util.sync";

type I18nValue = {
    locale: Accessor<Locales>;
    LL: Accessor<TranslationFunctions>;
    setLocale: Setter<Locales>;
};
const I18nContext = createContext<I18nValue>();

export default function TypesafeI18n(props: ParentProps<{ locale: Locales }>) {
    const [locale, setLocale] = createSignal(untrack(() => props.locale));
    const translated = createMemo(() => {
        const current = locale();
        loadLocale(current);
        // The translation proxy implements arbitrary properties, including async symbols.
        // Keep it inside a plain object so Solid does not treat it as an async source.
        return { functions: i18nObject(current) };
    });
    const LL = () => translated().functions;
    return createComponent(I18nContext, {
        value: { locale, LL, setLocale },
        get children() { return props.children; },
    });
}

export const useI18nContext = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error("Missing TypesafeI18n provider");
    return context;
};
