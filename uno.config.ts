import { defineConfig, presetIcons, presetWind, transformerCompileClass, transformerDirectives } from 'unocss';

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
    include: [/(src).*\.(css|[jt]sx?)$/],
    exclude: [],
    transformers: transformer,
    theme: {
        extends: {
            transitionProperty: {
                "max-height": "max-height",
            },
        }
    },
    rules: [
        ["font-base", { "font-family": '"Zilla Slab", Georgia, "Noto Serif SC", "Microsoft YaHei", SimSun, serif' }],
        ["font-headline", { "font-family": '华文黑体, "Microsoft YaHei", Heiti, "sans-serif"' }],
        ["font-mono", { "font-family": "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace" }],
        ["shadow-round", { "box-shadow": "#39526063 0px 0px 3px" }],
        ["card-outline", { "outline": "solid 1px var(--cc)" }],
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
        "h-menu": "h-11 sm:h-14 px-2.5 sm:px-3",
        "w-view": '2xl:w-308 xl:w-270 lg:w-240 mx-auto max-w-full',
        "w-viewl": '2xl:w-314 xl:w-276 lg:w-246 mx-auto',
        'h-coverMain': '2xl:h-76  lg:h-71.5 h-69',
        'blog-cover': '2xl:h-100 lg:h-80 h-64',
        'w-coverMain': '2xl:w-[22rem] xl:w-80 lg:w-64 w-full',
        "text-link": "shadow-[0_-.05rem_0_var(--menu-hover-text)_inset] hover:shadow-[0_-1.15rem_0_var(--menu-hover-text)_inset] text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)]",
        "header-justify": "justify-between <sm:justify-center flex flex-grow",
        "main-responsive": "md:grid md:mx-4 lg:mx-auto",
        "article-responsive": "2xl:col-span-37 md:col-span-36 md:mr-4 lg:mr-8",
        "title-responsive": "text-3xl <md:text-2xl <md:leading-10 <md:my-2",
        "subtitle-responsive": "text-2xl <md:leading-relaxed <md:text-[1.4rem]",
        "toc-responsive": "<md:fixed <md:bottom-5 <md:w-full <md:bg-[var(--ers-bg)] <md:z-20 <md:px-4",
        "hr-section": "<lg:mx-4 w-24 my-8 border-none",
        "p-section": "<md:mx-4",
        "bq-section": "border-l-4 border-[var(--head-border)] bg-[var(--menu-hover-bg)] my-4 pl-3 pr-4 <md:mr-4",
        "aside-responsive": "md:col-span-14 2xl:col-span-13 <md:mx-4 <md:mt-8",
        "body-responsive": " md:grid md:min-h-screen grid-rows-[auto_1fr_auto] ",
        "life-responsive": "grid grid-cols-4 md:grid-cols-5 gap-4 <md:mx-4",
        "notify-responsive": "md:py-4 md:bottom-10 <md:w-full md:left-10"
    },
    presets: [
        presetWind(),
        presetIcons({
            extraProperties: {
                'display': 'inline-block',
                'vertical-align': 'middle',
            }
        }),
    ],
})