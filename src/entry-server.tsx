// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

import { Locale } from "~/utils/locale";


export default createHandler((context) => (
  <StartServer
    document={({ assets, children, scripts }) => {
      let locale: Locale = "zh-CN"
      __EN_POSTS.forEach(post => context.nativeEvent._path?.includes(post) && (locale = "en"))
      return <html lang={locale}>
        <head>
          <script innerHTML={`window.lt=()=>localStorage.getItem('customer-theme')||'auto';window.mt=()=>window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';!function(){let e=window.lt(); if(e==='auto') e = window.mt();document.documentElement.setAttribute("class", e);}()`} />
          {assets}
        </head>
        <body class=":: font-base antialiased bg-main text-main md:grid md:min-h-screen grid-rows-[auto_1fr_auto] ">
          {children}
          {scripts}
        </body>
      </html>
    }}
  />
));
