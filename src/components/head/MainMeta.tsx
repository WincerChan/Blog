import siteConf from '@/hugo.json';
import { Meta } from "@solidjs/meta";
import { Show } from 'solid-js';
import { Link, Title } from 'solid-start';
import { HeadParamsTyoe } from '~/schema/Head';

const MainMeta = ({ params }: { params: HeadParamsTyoe }) => {
    const title = params.title ? `${params.title} · ${siteConf.title}` : siteConf.title
    return (
        <>
            <Link rel="preconnect" href={siteConf.cdnURL} />
            <Link rel="preconnect" href="https://npm.onmicrosoft.cn" crossOrigin='' />
            <Meta charset="utf-8" />
            <Meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
            <Title>{title}</Title>
            <Meta name="description" content={params.description || siteConf.description} />
            <Meta name="keywords" content={params.keywords.join(", ")} />
            <Meta name="referrer" content="same-origin" />
            <Meta name="date" content={params.date} />
            <Meta name="author" content={siteConf.author.name} />
            <Meta name="theme-color" content="#fff" />
            <Link rel="canonical" href={new URL(params.pageURL, siteConf.baseURL).toString()} />
            <Link rel="manifest" href="/manifest.webmanifest" />
            <Link as='image' href={siteConf.avatar} rel='preload' />
            <Show when={params.cover}>
                <Link as='image' href={params.cover} rel='preload' />
            </Show>
        </>
    );
};

export default MainMeta;
