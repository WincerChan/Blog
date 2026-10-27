import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildAtom } from '../../../tools/content/atom';
import { readSiteConf } from '../../../tools/content/site';

export const prerender = true;

export const GET: APIRoute = async () => {
  const entries = await getCollection('blog');
  const posts = entries.flatMap(entry => entry.data.kind === 'post' ? [entry.data.value] : []);
  const site = await readSiteConf(process.cwd());
  return new Response(buildAtom({ site, posts }), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
