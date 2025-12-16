// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

import '@unocss/reset/tailwind.css';
import "nprogress/nprogress.css";
import "highlight.js/styles/magula.css";
import "virtual:uno.css";
import "~/styles/color.css";
import "~/styles/photograph.css";


export default mount(() => <StartClient />, document.body);
