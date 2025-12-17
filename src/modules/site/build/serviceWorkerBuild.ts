import { resolve } from "path";
import { build } from "vite";

const ServiceWorkerBuild = (dirname) => {
    let isSSRBuild = false;
    let built = false;
    return {
        name: "vite-plugin-sw-build",
        apply: "build",
        configResolved(config) {
            isSSRBuild = !!config.build?.ssr;
        },
        async closeBundle() {
            if (built || isSSRBuild) return;
            built = true;
            await build({
                configFile: false,
                build: {
                    outDir: resolve(dirname, "public"),
                    emptyOutDir: false,
                    rollupOptions: {
                        input: resolve(dirname, "src/modules/site/service-worker.ts"),
                        output: {
                            entryFileNames: "sw.js",
                        },
                    },
                },
            });
        },
    };
};

export default ServiceWorkerBuild;
