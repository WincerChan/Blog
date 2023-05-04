import { Link, Meta, Title } from 'solid-start';
import siteConf from '~/../hugo.json';
import { HeadParamsTyoe } from '~/schema/Head';

const MainMeta = ({ params }: { params: HeadParamsTyoe }) => {
    const title = params.title ? `${params.title} · ${siteConf.title}` : siteConf.title
    return (
        <>
            <Meta charset="utf-8" />
            <Meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
            <Link rel="canonical" href={new URL(params.pageURL, siteConf.baseURL).toString()} />
            <Link rel="preconnect" href={siteConf.cdnURL} />
            <Link rel="preconnect" href="https://g.alicdn.com" />
            <Title>{title}</Title>
            <Meta name="description" content={params.description || siteConf.description} />
            <Meta name="keywords" content={params.keywords.join(", ")} />
            <Meta name="referrer" content="same-origin" />
            <Meta name="date" content={params.date.toISOString()} />
            <Meta name="author" content={siteConf.author.name} />
            <Link rel="manifest" href="/manifest.webmanifest" />
            <Meta name="theme-color" content="#065279" />
        </>
    );
};

export default MainMeta;
