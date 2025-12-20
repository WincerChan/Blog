export const theme = {
    boxShadow: {
        card: "#39526063 0px 0px 3px",
    },
    backgroundColor: {
        surface: "var(--surface-bg)",
        main: "var(--main-bg)",
        menu: "var(--menu-hover-bg)",
    },
    fontFamily: {
        base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Roboto, 'PingFang SC', 'Source Han Sans SC', 'Microsoft YaHei',  Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        headline: "'Source Han Serif SC','Source Han Serif CN','Noto Serif CJK SC','Noto Serif SC',serif",
        sitetitle:
            "open sans,-apple-system,BlinkMacSystemFont,segoe ui,helvetica,arial,pingfang sc,source han sans sc,noto sans cjk sc,sarasa gothic sc,microsoft yahei,sans-serif,apple color emoji,segoe ui emoji",
        mono: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    },
    textColor: {
        main: "var(--main-text)",
        "menu-active": "var(--menu-hover-text)",
    },
} as const;
