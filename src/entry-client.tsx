// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

import '@unocss/reset/tailwind.css';
import "nprogress/nprogress.css";
import "virtual:uno.css";
import "~/styles/color.css";
import "~/styles/photograph.css";

mount(() => <StartClient />, document.body);
