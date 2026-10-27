import { ChangeFreqEnum, type SitemapItem } from '@astrojs/sitemap';
import type { Post, Page } from '../../src/content/types';
import type { SiteConf } from './site';
import { parseDateLikeHugo } from './time';

// Only public sitemap fields cross from the content loader to the build hook.
export const SITEMAP_METADATA_FILE = 'blog-sitemap.json';
export type SitemapMetadata = Record<string, SitemapItem & {
  img?: Array<{ url: string; caption?: string }>;
}>;

function imagesForEntry(baseURL: string, entry: Page | Post) {
  const images: Array<{ url: string; caption?: string }> = [];
  const seen = new Set<string>();
  const add = (src: string, caption?: string) => {
    if (!src.trim() || src.startsWith('data:')) return;
    let url: URL;
    try { url = new URL(src, baseURL); } catch { return; }
    if (!['http:', 'https:'].includes(url.protocol) || seen.has(url.href)) return;
    seen.add(url.href);
    images.push({ url: url.href, ...(caption?.trim() ? { caption: caption.trim() } : {}) });
  };
  if (entry.cover) add(entry.cover, 'cover');
  // The loader passes sanitized data, but never inspect encrypted article bodies.
  if ('encrypted' in entry && entry.encrypted) return images;
  let count = 0;
  for (const [tag] of (entry.html ?? '').matchAll(/<img\b[^>]*>/gi)) {
    const attribute = (name: string) => {
      const match = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
      return match?.[1] ?? match?.[2] ?? match?.[3];
    };
    const src = attribute('src');
    if (!src) continue;
    add(src, attribute('alt'));
    if (++count === 5) break;
  }
  return images;
}

export function buildSitemapMetadata({ site, posts, pages }: {
  site: SiteConf;
  posts: Post[];
  pages: Page[];
}): SitemapMetadata {
  const changefreq = Object.values(ChangeFreqEnum).find(value => value === site.sitemap.changeFreq);
  if (!changefreq) throw new Error(`[sitemap] Invalid change frequency: ${site.sitemap.changeFreq}`);
  const absolute = (pathname: string) => new URL(pathname, `${site.baseURL}/`).href;
  const postUrl = (slug: string) => absolute(`posts/${encodeURIComponent(slug)}/`);
  const visiblePosts = posts.filter(post => !post.draft);
  const bySlug = new Map(visiblePosts.map(post => [post.slug, post]));
  const metadata: SitemapMetadata = {};
  const home = absolute('');
  metadata[home] = { url: home, changefreq: ChangeFreqEnum.DAILY, priority: 1 };
  const addEntry = (url: string, entry: Post | Page) => {
    metadata[url] = {
      url, lastmod: parseDateLikeHugo(entry.updated).toISOString(),
      changefreq,
      priority: site.sitemap.priority,
      img: imagesForEntry(site.baseURL, entry),
    };
  };
  for (const post of visiblePosts) {
    const url = postUrl(post.slug);
    addEntry(url, post);
    if (!post.lang) continue;
    const shortLang = post.lang === 'en' ? 'en' : 'zh';
    const otherSlug = post.isTranslation
      ? post.slug.replace(new RegExp(`-${shortLang}$`), '')
      : `${post.slug}-${shortLang === 'en' ? 'zh' : 'en'}`;
    const other = bySlug.get(otherSlug);
    // Do not advertise a missing/draft translation as an alternate URL.
    if (other?.lang && other.slug !== post.slug) metadata[url].links = [
      { lang: post.lang, url }, { lang: other.lang, url: postUrl(other.slug) },
    ];
  }
  for (const page of pages.filter(page => !page.draft)) {
    addEntry(absolute(`${encodeURIComponent(page.slug)}/`), page);
  }
  for (const post of visiblePosts.filter(post => !post.isTranslation && post.category)) {
    const url = absolute(`category/${encodeURIComponent(post.category!)}/`);
    const updated = parseDateLikeHugo(post.updated).toISOString();
    const previous = metadata[url]?.lastmod;
    metadata[url] = {
      url, lastmod: previous && new Date(previous).getTime() > new Date(updated).getTime() ? previous : updated,
      changefreq,
      priority: site.sitemap.termPriority,
    };
  }
  return metadata;
}
