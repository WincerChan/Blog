import { defineConfig, presetWind, transformerCompileClass, transformerDirectives } from 'unocss';

const isProd = process.env.NODE_ENV === "production";
let transformer = [
    transformerDirectives({ enforce: 'pre' })
]

if (isProd) {
    transformer.push(
        transformerCompileClass({
            trigger: "::",
            classPrefix: ""
        })
    )
}

export default defineConfig({
    content: {
        pipeline: {
            include: [/(src).*\.(css|[jt]sx?)$/],
            exclude: []
        }
    },
    transformers: transformer,
    theme: {
        extends: {
            transitionProperty: {
                "max-height": "max-height",
            },
        }
    },
    rules: [
        ["font-sitetitle", { "font-family": 'open sans,-apple-system,BlinkMacSystemFont,segoe ui,helvetica,arial,pingfang sc,source han sans sc,noto sans cjk sc,sarasa gothic sc,microsoft yahei,sans-serif,apple color emoji,segoe ui emoji' }],
        ["font-base", { "font-family": '"Zilla Slab", Georgia, "Noto Serif SC", "Microsoft YaHei", SimSun, serif' }],
        ["font-headline", { "font-family": '华文黑体, "Microsoft YaHei", Heiti, "sans-serif"' }],
        ["font-mono", { "font-family": "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace" }],
        ["shadow-round", { "box-shadow": "#39526063 0px 0px 3px" }],
        ["card-outline", { "outline": "solid 1px var(--blockquote-border)" }],
        ["scrollbar-none", { "-ms-overflow-style": "none", "scrollbar-width": "none" }],
        ["player-bg", { "background": " rgba(0, 0, 0, 0) linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.8)) repeat scroll 0% 0%" }]
    ],
    shortcuts: {
        'bg-menuHover': 'hover:bg-[var(--menu-hover-bg)]',
        'bg-ers': 'bg-[var(--ers-bg)]',
        'text-title': 'text-[var(--title)]',
        'text-subtitle': 'text-[var(--subtitle)]',
        'text-menuActive': 'text-[var(--menu-hover-text)]',
        'text-menuHover': 'hover:text-menuActive hover:underline underline-1 underline-offset-4',
        'toggle-active': 'bg-[var(--menu-hover-bg)] text-[var(--menu-hover-text)]',
        'text-footer': 'text-[var(--footer-text)]',
        "trans-linear": "transition duration-100 ease-linear",
        "h-menu": "sm:h-16 h-12 px-[12px] sm:px-[14px] lg:px-6",
        "w-view": 'xl:w-284 lg:w-220 mx-auto max-w-full',
        "w-viewl": 'xl:w-292 lg:w-228 mx-auto',
        'h-coverMain': '2xl:h-80  lg:h-74 h-68',
        'blog-cover': '2xl:h-100 lg:h-80 h-72',
        'w-coverMain': '2xl:w-[22rem] xl:w-80 lg:w-64 w-full',
        "text-link": "shadow-[0_-.05rem_0_var(--menu-hover-text)_inset] hover:shadow-[0_-1.15rem_0_var(--menu-hover-text)_inset] text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)]",
        "header-justify": "justify-between <sm:justify-center flex flex-grow",
        "main-responsive": "md:grid md:mx-4 lg:mx-auto",
        "article-responsive": "md:mr-4 lg:mr-8",
        "title-responsive": "text-4xl <md:text-3xl <md:leading-10 <md:my-2",
        "subtitle-responsive": "text-3xl <md:leading-relaxed <md:text-2xl",
        "toc-responsive": "<lg:fixed <lg:bottom-0 <lg:w-full <lg:bg-[var(--ers-bg)] <lg:px-4",
        "hr-section": "<lg:mx-4 w-24 my-8 border-none",
        "bq-section": "border-l-6 border-[var(--blockquote-border)] text-[var(--blockquote-text)] my-4 pl-3 pr-4",
        "aside-responsive": "md:col-span-14 2xl:col-span-13 <md:mt-8",
        "body-responsive": " md:grid md:min-h-screen grid-rows-[auto_1fr_auto] ",
        "life-responsive": "grid grid-cols-4 md:grid-cols-5 gap-4 ",
        "notify-responsive": "md:py-4 md:bottom-10 <md:w-full md:left-10",
        "list-items": "pl-8 px-4 my-2 ",
        "content-width": " xl:w-192 md:w-168 md:mx-auto mx-4 ",
        "mobile-width-beyond": " <md:w-100vw <md:max-w-none <md:-ml-4 "
    },
    presets: [
        presetWind(),
    ],
})