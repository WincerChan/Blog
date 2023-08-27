import dotenv from 'dotenv';
import path from "path";
import staticAdpater from "solid-start-static";
import solid from "solid-start/vite";
import UnoCSS from 'unocss/vite';
import { defineConfig } from "vite";
import jsonxPlugin from "./plugin/jsonx";
import { en_nav_pages, en_posts, postsByYear, postsByYearDetail, randomTags, totalCategories, totalPosts, totalTags, wordsCount, zh_nav_pages } from "./plugin/statsPreload";
import viteSwBuild from "./plugin/swBuild";

dotenv.config()

const isProd = process.env.NODE_ENV === "production";
const definedVars = {
  __WORDS: wordsCount,
  __TAGS: randomTags,
  __ALL_TAGS: totalTags,
  __TOTAL_POSTS: totalPosts,
  __IS_PROD: isProd,
  __POSTS_BY_YEAR: postsByYear,
  __POSTS_BY_YEAR_DETAIL: postsByYearDetail,
  __EN_POSTS: en_posts,
  __EN_NAV: en_nav_pages,
  __ZH_NAV: zh_nav_pages,
  __TOTAL_CATEGORIES: totalCategories
}

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "@": path.resolve(__dirname, "")
    }
  },
  define: definedVars,
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name].js",
      }
    },
    minify: false
  },
  plugins: [
    jsonxPlugin(),
    solid({ adapter: staticAdpater(), extensions: [".jsonx"] }),
    UnoCSS(),
    viteSwBuild()
  ],
});
