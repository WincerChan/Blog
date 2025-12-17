import { defineConfig } from "@solidjs/start/config";
import fs from "fs";
import path from "path";
import UnoCSS from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import { fileURLToPath } from 'url';
import { en_nav_pages, en_posts, postsByYear, postsByYearDetail, totalCategories, totalPosts, totalTags, wordsCount, zh_nav_pages } from "./src/modules/site/build/statsPreload";
import ServiceWorkerBuild from "./src/modules/site/build/serviceWorkerBuild";
const isProd = process.env.NODE_ENV === "production";

const siteConfigPath = fileURLToPath(new URL("./site.config.json", import.meta.url));
const BlogConf = JSON.parse(fs.readFileSync(siteConfigPath, "utf8"));

const definedVars = {
    __WORDS: wordsCount,
    __ALL_TAGS: totalTags,
    __TOTAL_POSTS: totalPosts,
    __POSTS_BY_YEAR: JSON.stringify(postsByYear),
    __POSTS_BY_YEAR_DETAIL: JSON.stringify(postsByYearDetail),
    __EN_POSTS: JSON.stringify(en_posts),
    __EN_NAV: JSON.stringify(en_nav_pages),
    __ZH_NAV: JSON.stringify(zh_nav_pages),
    __TOTAL_CATEGORIES: totalCategories,
    __SITE_CONF: BlogConf
}


const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);
export default defineConfig({
    extensions: ["ts", "tsx", "js", "jsx"],
    server: {
        prerender: {
            crawlLinks: true,
            routes: ["/", ...en_posts, "/404/"]
        },
    },
    vite: {
        resolve: {
            alias: {
                "~": path.resolve(__dirname, "src"),
                "@": path.resolve(__dirname, "")
            }
        },
        define: definedVars,
        plugins: [
            Icons({ autoInstall: true, compiler: 'solid' }),
            UnoCSS(),
            ServiceWorkerBuild(__dirname)
        ],
        build: {
            rollupOptions: {
                output: {
                    minifyInternalExports: true,
                    experimentalMinChunkSize: 102400,
                }
            },
            // minify: false,
            // terserOptions: {
            //     compress: false,
            //     mangle: false,
            // },
        }
    }
});
