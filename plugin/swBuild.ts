import { resolve } from "path"
import { Plugin, build } from "vite"

const viteSwBuild = () => {
    return <Plugin>{
        name: 'vite-plugin-sw-build',
        enforce: "post",
        closeBundle() {
            build({
                configFile: false,
                build: {
                    outDir: resolve(__dirname, "../dist/public"),
                    emptyOutDir: false,
                    rollupOptions: {
                        input: resolve(__dirname, "../src/serviceWorker.ts"),
                        output: {
                            entryFileNames: "sw.js"
                        }
                    }
                }
            })
        }
    }
}

export default viteSwBuild