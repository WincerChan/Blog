import { defineConfig } from "@solidjs/start/config";
import path from "path";
import UnoCSS from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import { fileURLToPath } from 'url';
import JsonX from "./plugin/jsonx";
import { en_nav_pages, en_posts, postsByYear, postsByYearDetail, totalCategories, totalPosts, totalTags, wordsCount, zh_nav_pages } from "./plugin/statsPreload";
const isProd = process.env.NODE_ENV === "production";

const BlogConf = {
    title: "Wincer's Blog",
    avatar: "https://ae02.alicdn.com/kf/Aeadf9a8f9b1246a580924fc003e514c8E.jpg",
    extURL: "https://blog-exts.itswincer.com",
    baseURL: "https://blog.itswincer.com",
    cdnURL: "https://cdn.blog.itswincer.net",
    description: "这里是 @Wincer,喜欢折腾新技术,却没多大耐心。个人博客会写得比较杂,包括日常吐槽、技术踩坑,偶尔会写正经一点的。欢迎订阅 RSS(•̀ᴗ•́)。",
    keywords: "Blog, 博客, Web, 生活, Wincer, Linux, Dev, FreeBSD, Elixir, Python, JavaScript",
    author: {
        name: "Wincer",
        url: "https://itswincer.com"
    },
}

const definedVars = {
    __WORDS: wordsCount,
    __ALL_TAGS: totalTags,
    __TOTAL_POSTS: totalPosts,
    __IS_PROD: isProd,
    __POSTS_BY_YEAR: postsByYear,
    __POSTS_BY_YEAR_DETAIL: JSON.stringify(postsByYearDetail),
    __EN_POSTS: en_posts,
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
            crawlLinks: true
        }
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
            JsonX(),
            UnoCSS()
        ],
        build: {
            sourcemap: false
        }
    }
});
