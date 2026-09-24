import { useHead } from "@solidjs/web";
const ApplicationMeta = () => {
    useHead([
        { tag: "meta", props: { name: "mobile-web-app-capable", content: "yes" } },
        { tag: "meta", props: { name: "application-name", content: __SITE_CONF.title } },
        { tag: "meta", props: { name: "msapplication-starturl", content: __SITE_CONF.baseURL } },
        { tag: "meta", props: { name: "msapplication-navbutton-color", content: "#065279" } },
        { tag: "meta", props: { name: "apple-mobile-web-app-capable", content: "yes" } },
        { tag: "meta", props: { name: "apple-mobile-web-app-title", content: __SITE_CONF.title } },
        { tag: "meta", props: { name: "apple-mobile-web-app-status-bar-style", content: "black" } },
        { tag: "link", key: "favicon-light", props: { rel: "icon", type: "image/svg+xml", href: "/favicon/light.svg", media: "(prefers-color-scheme: light)" } },
        { tag: "link", key: "favicon-dark", props: { rel: "icon", type: "image/svg+xml", href: "/favicon/dark.svg", media: "(prefers-color-scheme: dark)" } },
        { tag: "link", props: { rel: "mask-icon", href: "/favicon/safari-pinned-tab.svg", color: "#1f6f6a" } },
        { tag: "link", props: { rel: "apple-touch-icon", href: "/favicon/generated/apple-touch-icon.png" } },
    ]);
    return null;
};

export default ApplicationMeta;
