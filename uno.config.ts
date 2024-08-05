import { defineConfig, presetWind, transformerCompileClass, transformerDirectives } from "unocss";

let transformers = [transformerDirectives({ enforce: 'pre' })]

if (process.env.NODE_ENV === "production") {
    transformers.push(
        transformerCompileClass({
            trigger: "::",
            classPrefix: ""
        })
    )
}

export default defineConfig({
    transformers: transformers,
    theme: {
        boxShadow: {
            'round': "#39526063 0px 0px 3px"
        },
        backgroundColor: {
            'ers': 'var(--ers-bg)',
            'main': 'var(--main-bg)',
            'menu': 'var(--menu-hover-bg)'
        },
        fontFamily: {
            'base': "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Roboto, 'PingFang SC', 'Source Han Sans SC', 'Microsoft YaHei',  Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
            'headline': "'Source Han Serif SC','Source Han Serif CN','Noto Serif CJK SC','Noto Serif SC',serif",
            'sitetitle': 'open sans,-apple-system,BlinkMacSystemFont,segoe ui,helvetica,arial,pingfang sc,source han sans sc,noto sans cjk sc,sarasa gothic sc,microsoft yahei,sans-serif,apple color emoji,segoe ui emoji',
            'mono': "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace"
        },
        textColor: {
            'main': 'var(--main-text)',
            'menu-active': 'var(--menu-hover-text)'
        }
    },
    rules: [
        ["outline-card", { "outline": "solid 1px var(--blockquote-border)" }],
    ],
    shortcuts: {
        "transition-linear": "transition duration-100 ease-linear",
        'text-menu-transition': 'text-menu-active underline underline-1 underline-offset-4',
        "mobile-width-beyond": " <md:w-[calc(100%+2rem)] <md:max-w-none <md:-ml-4 ",
        "menu-hover-transition": 'hover:bg-menu transition-linear hover:text-menu-transition ',
        "text-link": "shadow-[0_-0.05rem_0_var(--menu-hover-text)_inset] hover:shadow-[0_-1.3rem_0_var(--menu-hover-text)_inset] text-[var(--menu-hover-text)] hover:text-[var(--menu-hover-bg)] ",
        "toc-modal": "<lg:fixed <lg:bottom-0 <lg:w-full <lg:bg-[var(--ers-bg)] <lg:px-4",
        "text-headline": "font-headline font-semibold leading-relaxed md:leading-loose md:text-3xl text-[1.7rem]",
        "disable-hover": "!hover:bg-transparent cursor-wait"
    },
    presets: [
        presetWind()
    ]
})