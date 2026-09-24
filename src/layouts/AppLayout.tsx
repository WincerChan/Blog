import { Element, createEffect } from "solid-js";
import { useLocation } from "@solidjs/router";
import { useI18nContext } from "~/i18n/i18n-solid";
import { loadLocale } from "~/i18n/i18n-util.sync";
import { trackPage, trackEngage } from "~/utils/track";
import { Locale } from "~/utils/locale";

interface MainProps {
    children: Element;
    className?: string;
    lang?: Locale;
    inkstoneToken?: string;
}

const trackHook = (token: () => string | undefined) => {
    const location = useLocation();
    let lastPath: string | null = null;
    let lastTrackedPath: string | null = null;

    createEffect(
        () => ({ nextPath: location.pathname, nextToken: token() }),
        ({ nextPath, nextToken }) => {
            if (!nextPath) return;
            if (lastPath && lastPath !== nextPath) trackEngage(true);
            lastPath = nextPath;
            if (!nextToken || lastTrackedPath === nextPath) return;
            trackPage(nextPath, nextToken);
            lastTrackedPath = nextPath;
    });
};

const localeHook = (lang: () => Locale | undefined) => {
    const { setLocale } = useI18nContext();

    createEffect(() => lang() || "zh-CN", (next) => {
        document.documentElement.lang = next;
        loadLocale(next);
        setLocale(next);
    });
};


const AppLayout = (props: MainProps) => {
    trackHook(() => props.inkstoneToken);
    localeHook(() => props.lang);

    return (
        <main class="w-full pb-16 md:pb-20 flex-1">
            {props.children}
        </main>
    );
};

export default AppLayout;
