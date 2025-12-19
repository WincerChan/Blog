import { defineConfig } from "@solidjs/start/config";
import velite from "@velite/plugin-vite";
import fs from "fs";
import path from "path";
import UnoCSS from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import { fileURLToPath } from 'url';
import {
    contentStatsEnNavPages,
    contentStatsEnPosts,
    contentStatsPostsByYear,
    contentStatsPostsByYearDetail,
    contentStatsTotalCategories,
    contentStatsTotalPosts,
    contentStatsTotalTags,
    contentStatsWordsCount,
    contentStatsZhNavPages,
} from "./tools/velite/build/contentStats";
import ServiceWorkerBuild from "./tools/vite/serviceWorkerBuild";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

const siteConfigPath = fileURLToPath(new URL("./site.config.json", import.meta.url));
const BlogConf = JSON.parse(fs.readFileSync(siteConfigPath, "utf8"));

const computeSwHash = () => {
    const slice = (v: string) => String(v).trim().slice(0, 12);

    const cfBuildId = process.env.CF_PAGES_BUILD_ID;
    if (cfBuildId) return slice(cfBuildId);
    const cf = process.env.CF_PAGES_COMMIT_SHA;
    if (cf) return cf.slice(0, 12);

    return slice(String(Date.now()));
};

const swHash = computeSwHash();

const definedVars = {
    __CONTENT_WORDS: contentStatsWordsCount,
    __CONTENT_TAGS: contentStatsTotalTags,
    __CONTENT_TOTAL_POSTS: contentStatsTotalPosts,
    __CONTENT_POSTS_BY_YEAR: JSON.stringify(contentStatsPostsByYear),
    __CONTENT_POSTS_BY_YEAR_DETAIL: JSON.stringify(contentStatsPostsByYearDetail),
    __CONTENT_EN_POSTS: JSON.stringify(contentStatsEnPosts),
    __CONTENT_EN_NAV: JSON.stringify(contentStatsEnNavPages),
    __CONTENT_ZH_NAV: JSON.stringify(contentStatsZhNavPages),
    __CONTENT_TOTAL_CATEGORIES: contentStatsTotalCategories,
    __SITE_CONF: BlogConf,
    __SW_HASH: JSON.stringify(swHash),
}
export default defineConfig({
    extensions: ["ts", "tsx", "js", "jsx"],
    server: {
        prerender: {
            crawlLinks: true,
            routes: ["/", ...contentStatsEnPosts, "/404/"]
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
            velite(),
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
