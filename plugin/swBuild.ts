import { resolve } from "path";
import { build } from "vite";

const SwBuild = (dirname) => {
    return {
        name: 'vite-plugin-sw-build',
        apply: 'build',
        closeBundle() {
            build({
                configFile: false,
                build: {
                    outDir: resolve(dirname, ".output/public"),
                    emptyOutDir: false,
                    rollupOptions: {
                        input: resolve(dirname, "src/service-worker.ts"),
                        output: {
                            entryFileNames: "sw.js"
                        }
                    }
                }
            })
        }
    }
}

export default SwBuild