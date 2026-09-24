import solid from "@solidjs/vite-plugin";
import { fileRoutes } from "filesystem-routing/vite";
import { defineConfig, type Plugin } from "vite";
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

const veliteModulePath = path.resolve(__dirname, "src/content/velite.ts");
const veliteServerModulePath = path.resolve(__dirname, "src/content/velite.server.ts");
const veliteClientModulePath = path.resolve(__dirname, "src/content/velite.client.ts");

const veliteClientBoundary: Plugin = {
    name: "velite:client-server-module-boundary",
    enforce: "pre" as const,
    applyToEnvironment: (environment: { name?: string }) => environment.name === "client",
    resolveId(id: string, importer?: string) {
        const importerPath = importer?.split("?", 1)[0];
        if (!importerPath || path.resolve(importerPath) !== veliteModulePath) return;

        const importPath = id.split("?", 1)[0];
        const resolvedImportPath = path.resolve(path.dirname(importerPath), importPath);
        if (
            importPath === veliteServerModulePath ||
            resolvedImportPath === veliteServerModulePath ||
            `${resolvedImportPath}.ts` === veliteServerModulePath
        ) {
            return veliteClientModulePath;
        }
    },
};

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

const appSharedModulePattern = new RegExp(
    [
        /src[\\/](?:content[\\/]velite|utils[\\/]inkstone|features[\\/]post-listing[\\/]OtherCards|layouts[\\/]PageLayout)\.tsx?$/.source,
        /arrow-right|github-logo|dot-outline-fill|icons[\\/]ph[\\/]list/.source,
        /vite[\\/]preload-helper/.source,
        /src[\\/]utils[\\/]index\.tsx$/.source,
        /@solidjs[\\/]router[\\/]dist[\\/]data[\\/]events\.js$/.source,
    ].join("|"),
);

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
    // Inline individual fields so each property read does not embed the full config object.
    ...Object.fromEntries(Object.entries(BlogConf).map(([key, value]) => [`__SITE_CONF.${key}`, JSON.stringify(value)])),
    __CONTENT_FRIENDS: JSON.stringify(friendsConfig),
    __SW_HASH: JSON.stringify(swHash),
};
export default defineConfig({
    plugins: [
        veliteClientBoundary,
        UnoCSS(),
        solid({ start: { renderMode: "async" }, ssr: true, extensions: [".jsx", ".tsx"] }),
        fileRoutes(),
        velite(),
        Icons({ autoInstall: true, compiler: "solid" }),
        ServiceWorkerBuild(__dirname),
        reloadPublicData(__dirname),
    ],
    // Expose only the non-sensitive API host to the browser bundle. Keep the
    // token secret out of client-side import.meta.env.
    envPrefix: ["VITE_", "INKSTONE_API_"],
    optimizeDeps: {
        include: ["typesafe-i18n", "typesafe-i18n/detectors", "typesafe-i18n/utils"],
    },
    build: { assetsDir: "_build/assets" },
    environments: {
        client: {
            build: {
                assetsDir: "_build/assets",
                rolldownOptions: {
                    output: {
                        codeSplitting: {
                            groups: [
                                // File routes expose separate entries. Merge the
                                // small app-shell modules that those entries commonly preload.
                                {
                                    name: "app-shared",
                                    test: appSharedModulePattern,
                                    priority: 10,
                                },
                            ],
                        },
                    },
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
});
