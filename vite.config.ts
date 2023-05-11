import path from "path";
import staticAdpater from "solid-start-static";
import solid from "solid-start/vite";
import UnoCSS from 'unocss/vite';
import { defineConfig } from "vite";
import siteConf from "./hugo.json";
import jsonxPlugin from "./plugin/jsonx";
import { randomTags, totalPosts, wordsCount } from "./plugin/statsPreload";
import viteSwBuild from "./plugin/swBuild";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  base: true ? siteConf.assetsPrefix : "/",
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "@": path.resolve(__dirname, "")
    }
  },
  define: {
    __WORDS: wordsCount,
    __TAGS: randomTags,
    __TOTAL_POSTS: totalPosts,
    __IS_PROD: isProd
  },
  build: {
    minify: false,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name].js",
        entryFileNames: "assets/[name].js"
      }
    }
  },
  plugins: [
    jsonxPlugin(),
    solid({ adapter: staticAdpater(), extensions: [".jsonx"] }),
    UnoCSS(),
    viteSwBuild()
  ]
});
