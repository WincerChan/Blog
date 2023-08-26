
import siteConf from "@/siteConf";
import { Link, Meta } from "solid-start";
const ApplicationMeta = () => {
    return (
        <>
            <Meta name="mobile-web-app-capable" content="yes" />
            <Meta name="application-name" content={siteConf.title} />
            <Meta name="msapplication-starturl" content={siteConf.baseURL} />
            <Meta name="msapplication-navbutton-color" content="#065279" />
            <Meta name="apple-mobile-web-app-capable" content="yes" />
            <Meta name="apple-mobile-web-app-title" content={siteConf.title} />
            <Meta name="apple-mobile-web-app-status-bar-style" content="black" />
            <Link href={`${siteConf.cdnURL}/v1.0.1`} rel="icon" type="image/ico" />
            <Link rel="apple-touch-icon" href={`${siteConf.cdnURL}/v1.0.1/apple-touch-icon.png`} />
        </>
    );
};

export default ApplicationMeta;
