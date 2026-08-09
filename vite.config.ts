import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import velite from "./tools/vite/velitePlugin.ts";
import fs from "node:fs";
import path from "node:path";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import { fileURLToPath } from "node:url";
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
} from "./tools/velite/stats.ts";
import reloadPublicData from "./tools/vite/reloadPublicData.ts";
import ServiceWorkerBuild from "./tools/vite/serviceWorkerBuild.ts";
import computeSwHash from "./tools/build/swHash.ts";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

const siteConfigPath = fileURLToPath(new URL("./site.config.json", import.meta.url));
const BlogConf = JSON.parse(fs.readFileSync(siteConfigPath, "utf8"));
const friendsConfigPath = fileURLToPath(new URL("./_blogs/content/friends.json", import.meta.url));
let friendsConfig: unknown[] = [];
try {
    const raw = fs.readFileSync(friendsConfigPath, "utf8");
    const parsed = JSON.parse(raw);
    friendsConfig = Array.isArray(parsed) ? parsed : [];
} catch {
    friendsConfig = [];
}

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
    __CONTENT_TOTAL_CATEGORIES: JSON.stringify(contentStatsTotalCategories),
    __SITE_CONF: BlogConf,
    __CONTENT_FRIENDS: JSON.stringify(friendsConfig),
    __SW_HASH: JSON.stringify(swHash),
};
export default defineConfig(({ command }) => ({
    plugins: [
        // SolidStart's dev manifest re-imports virtual styles with `?inline`.
        // Mark UnoCSS's root-relative ID as virtual so Vite 8 does not apply
        // filesystem access checks before UnoCSS can load it.
        {
            name: "unocss:ssr-inline-virtual-module",
            enforce: "pre",
            resolveId(id) {
                if (id === "/__uno.css?inline") {
                    return `\0${id}`;
                }
            },
        },
        UnoCSS(),
        solidStart({ extensions: ["ts", "tsx", "js", "jsx"] }),
        nitro(),
        velite(),
        Icons({ autoInstall: true, compiler: "solid" }),
        ServiceWorkerBuild(__dirname),
        reloadPublicData(__dirname),
    ],
    // UnoCSS 66 locates Vite's CSS post-plugin through the root build dir.
    // Keep this build-only: Nitro dev otherwise serves stale production files.
    build: command === "build" ? { outDir: ".output/public" } : undefined,
    nitro: {
        preset: "static",
        prerender: {
            crawlLinks: true,
            routes: ["/", ...contentStatsEnPosts, "/404/"],
        },
    },
    environments: {
        client: {
            build: {
                rolldownOptions: {
                    output: {
                        codeSplitting: {
                            groups: [
                                // SolidStart exposes route modules as separate entries. Merge the
                                // small app-shell modules that those entries commonly preload.
                                {
                                    name: "app-shared",
                                    test: /src[\\/](?:content[\\/]velite|utils[\\/]inkstone|features[\\/]post-listing[\\/]OtherCards|layouts[\\/]PageLayout)\.tsx?$|arrow-right/,
                                    priority: 10,
                                },
                            ],
                        },
                    },
                },
            },
        },
        // Nitro's Vite builder currently requires an input for the final
        // environment even though the static preset only deploys public files.
        nitro: {
            build: {
                rolldownOptions: {
                    input: "./tools/nitro/static-entry.ts",
                },
            },
        },
    },
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "src"),
            "@": path.resolve(__dirname, ""),
        },
    },
    define: definedVars,
}));
