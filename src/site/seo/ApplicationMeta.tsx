
import { Link, Meta } from "@solidjs/meta";
const ApplicationMeta = () => {
    return (
        <>
            <Meta name="mobile-web-app-capable" content="yes" />
            <Meta name="application-name" content={__SITE_CONF.title} />
            <Meta name="msapplication-starturl" content={__SITE_CONF.baseURL} />
            <Meta name="msapplication-navbutton-color" content="#065279" />
            <Meta name="apple-mobile-web-app-capable" content="yes" />
            <Meta name="apple-mobile-web-app-title" content={__SITE_CONF.title} />
            <Meta name="apple-mobile-web-app-status-bar-style" content="black" />
            <Link rel="icon" type="image/svg+xml" href="/favicon/light.svg" media="(prefers-color-scheme: light)" />
            <Link rel="icon" type="image/svg+xml" href="/favicon/dark.svg" media="(prefers-color-scheme: dark)" />
            <Link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#1f6f6a" />
            <Link rel="apple-touch-icon" href="/favicon/generated/apple-touch-icon.png" />
        </>
    );
};

export default ApplicationMeta;
