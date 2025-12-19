// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

import { Locale } from "~/utils/locale";

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
                        <script
                            innerHTML={`window.lt=()=>localStorage.getItem('customer-theme')||'auto';window.mt=()=>window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';!function(){let e=window.lt(); if(e==='auto') e = window.mt();document.documentElement.setAttribute("class", e);}()`}
                        />
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
