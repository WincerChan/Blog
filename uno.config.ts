import transformerCompileClass from '@unocss/transformer-compile-class'
import { defineConfig, presetIcons, presetWind, transformerDirectives } from 'unocss'

export default defineConfig({
    include: [/(src).*\.(css|[jt]sx?)$/],
    exclude: [],
    transformers: [
        transformerCompileClass({
            trigger: "::",
            classPrefix: ""
        }),
        transformerDirectives({ enforce: 'pre' })
    ],
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
        'h-coverMain': '2xl:h-76 xl:h-74 h-66',
        'blog-cover': '2xl:h-100 lg:h-80 h-64',
        'w-coverMain': '2xl:w-[22rem] xl:w-80 lg:w-64 w-full',
        "text-link": "shadow-[0_-.05rem_0_var(--menu-hover-text)_inset] hover:shadow-[0_-1.2rem_0_var(--menu-hover-text)_inset]",
        "header-justify": "justify-between <sm:justify-center flex flex-grow"
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