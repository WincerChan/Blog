
import { Link, Meta } from "solid-start";
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
            <Link href={`${__SITE_CONF.cdnURL}/v1.0.1`} rel="icon" type="image/ico" />
            <Link rel="apple-touch-icon" href={`${__SITE_CONF.cdnURL}/v1.0.1/apple-touch-icon.png`} />
        </>
    );
};

export default ApplicationMeta;
