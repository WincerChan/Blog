import dotenv from 'dotenv';
import path from "path";
import staticAdpater from "solid-start-static";
import solid from "solid-start/vite";
import UnoCSS from 'unocss/vite';
import { defineConfig } from "vite";
import jsonxPlugin from "./plugin/jsonx";
import { postsByYear, randomTags, totalPosts, totalTags, wordsCount } from "./plugin/statsPreload";
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
    }
  },
  plugins: [
    jsonxPlugin(),
    solid({ adapter: staticAdpater(), extensions: [".jsonx"], experimental: { islands: true, islandsRouter: true } }),
    UnoCSS(),
    viteSwBuild()
  ],
});
