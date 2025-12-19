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

                        {import.meta.env.PROD && (
                            <script
                                innerHTML={`
            if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register("/sw.js?v=${__SW_HASH}",{scope:"/"}).then(reg => {
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              newWorker?.addEventListener('statechange', () => {
                switch (newWorker.state) {
                  case 'installed':
                    if (navigator.serviceWorker.controller) {const updateButton = document.getElementById('sw-notify');updateButton.style.display = 'block';setTimeout(()=>updateButton.style.display='', 5000)}
                    break;
                  case 'redundant':
                    break;
                }
              });
            });
          })
        }
            `}
                            />
                        )}
                    </body>
                </html>
            );
        }}
    />
));
