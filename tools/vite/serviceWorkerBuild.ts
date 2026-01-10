import { resolve } from "node:path";
import { build } from "vite";

const ServiceWorkerBuild = (dirname: string) => {
  let isSSRBuild = false;
  let built = false;
  return {
    name: "vite-plugin-sw-build",
    apply: "build",
    configResolved(config: any) {
      isSSRBuild = !!config.build?.ssr;
    },
    async closeBundle() {
      if (built || isSSRBuild) return;
      built = true;
      await build({
        configFile: false,
        publicDir: false,
        build: {
          outDir: resolve(dirname, "public"),
          emptyOutDir: false,
          rollupOptions: {
            input: resolve(dirname, "src/site/service-worker.ts"),
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
