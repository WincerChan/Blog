// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

import { Locale } from "~/utils/locale";
import { themeInitScript } from "~/features/theme";

export default createHandler((context) => (
    <StartServer
        document={({ assets, children, scripts }) => {
            let locale: Locale = "zh-CN";
            __CONTENT_EN_POSTS.forEach(
                (post) =>
                    context.nativeEvent._path?.includes(post) &&
                    (locale = "en"),
            );
            return (
                <html lang={locale}>
                    <head>
                        <script innerHTML={themeInitScript} />
                        {assets}
                    </head>
                    <body>
                        {children}
                        {scripts}
                    </body>
                </html>
            );
        }}
    />
));
