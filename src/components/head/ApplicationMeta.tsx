
import { Link, Meta } from "solid-start";
import siteConfig from "~/../hugo.json";
const ApplicationMeta = () => {
    return (
        <>
            <Meta name="mobile-web-app-capable" content="yes" />
            <Meta name="application-name" content={siteConfig.title} />
            <Meta name="msapplication-starturl" content={siteConfig.baseURL} />
            <Meta name="msapplication-navbutton-color" content="#065279" />
            <Meta name="apple-mobile-web-app-capable" content="yes" />
            <Meta name="apple-mobile-web-app-title" content={siteConfig.title} />
            <Meta name="apple-mobile-web-app-status-bar-style" content="black" />
            <Link href={`${siteConfig.cdnURL}/v1.0.1`} rel="icon" type="image/ico" />
            <Link rel="apple-touch-icon" href={`${siteConfig.cdnURL}/v1.0.1/apple-touch-icon.png`} />
        </>
    );
};

export default ApplicationMeta;
