
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
            <Link href="https://cdn.jsdelivr.net/npm/wir@1.0.2/android-chrome-192x192.png" rel="icon" type="image/ico" />
            <Link rel="apple-touch-icon" href={`https://ae01.alicdn.com/kf/H3581d2df939f4c3182b1d4b9c2a47bdaO.png`} />
        </>
    );
};

export default ApplicationMeta;
