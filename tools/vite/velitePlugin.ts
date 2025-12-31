import type { Plugin } from "vite";
import { build } from "velite";

// Copied from https://github.com/zce/velite/tree/main/packages/vite
type Options = {
    /**
     * Path to velite.config.ts
     * @default "velite.config.{js,ts}"
     */
    config?: string;
};

const velitePlugin = (options: Options = {}): Plugin => {
    let started = false;

    return {
        name: "@velite/plugin-vite",
        configureServer: async () => {
            if (started) return;
            started = true;
            await build({ config: options.config, watch: true });
        },
        buildStart: async () => {
            if (started) return;
            await build({ config: options.config, watch: false });
        },
    };
};

export default velitePlugin;
export type { Options };
