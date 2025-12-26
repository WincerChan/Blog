// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

import '@unocss/reset/tailwind.css';
import "highlight.js/styles/magula.css";
import "virtual:uno.css";
// import "~/styles/color.css";
// import "~/styles/photograph.css";
import { registerServiceWorker } from "~/utils/sw";
import { onMount } from "solid-js";


export default mount(() => {
    onMount(() => {
        if (import.meta.env.PROD) registerServiceWorker();
    });
    return <StartClient />;
}, document.body);
