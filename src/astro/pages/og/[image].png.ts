import type { APIRoute, GetStaticPaths } from 'astro';
import { posts, pages } from '../../content';
import { readSiteConf } from '../../../../tools/content/site';
import { collectOgTargets, ogRenderInput, type OgRenderInput } from '../../../../tools/content/og/targets';
import { ogImageFilename } from '../../../../tools/content/og/paths';
import { getOgRenderer, prepareOgImages } from '../../../../tools/content/og/renderer';

export const prerender = true;
export const getStaticPaths = (async () => {
  const site = await readSiteConf(process.cwd());
  const targets = collectOgTargets({ site, posts, pages, publishedPosts: posts.filter(post => !post.isTranslation) });
  const routes = targets.map(target => ({
    params: { image: ogImageFilename(target.slug).slice(0, -4) },
    props: { input: ogRenderInput(target, site) },
  }));
  if (new Set(routes.map(route => route.params.image)).size !== routes.length) {
    throw new Error('OG image filenames collide');
  }
  // Production pre-renders all PNGs; dev generates only the requested image.
  if (import.meta.env.PROD) await prepareOgImages(routes.map(route => route.props.input));
  return routes;
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const renderer = await getOgRenderer();
  const png = await renderer.get(props.input as OgRenderInput);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
