import type { ParentProps } from "solid-js";
import { getRequestEvent, HydrationScript, isServer } from "@solidjs/web";
import { themeInitScript } from "~/features/theme/theme";
import { detectLocaleFromPath } from "~/utils/locale";

export default function Document(props: ParentProps) {
    const pathname = isServer
        ? new URL(getRequestEvent()!.request.url).pathname
        : window.location.pathname;
    return (
        <html lang={detectLocaleFromPath(pathname)}>
            <head>
                <meta charset="utf-8" />
                <script innerHTML={themeInitScript} />
                <HydrationScript />
            </head>
            <body>{props.children}</body>
        </html>
    );
}
