import { createHash } from 'node:crypto';
import { create } from 'xmlbuilder';
import type { SiteConf } from './site';
import { formatUtc, parseDateLikeHugo } from './time';
import { resolveOgImageUrl } from './og/paths';

type AtomPost = {
  slug: string;
  title: string;
  date: string;
  updated: string;
  html: string;
  summary: string;
  encrypted: boolean;
  category?: string;
  tags: string[];
  draft?: boolean;
  isTranslation?: boolean;
};

const encryptedNotice = '抱歉，本文已加密，请至网站输入密码后阅读。';

// Preserve Hugo's historical hash slicing, including its nonstandard UUID layout.
const legacyAtomId = (value: string) => {
  const hex = createHash('sha1').update(value).digest('hex');
  return `urn:uuid:${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 17)}9${hex.slice(17, 19)}-${hex.slice(21, 33)}`;
};

export function buildAtom({ site, posts }: { site: SiteConf; posts: AtomPost[] }): string {
  const base = new URL('/', site.baseURL).toString();
  const published = posts.filter(post => !post.draft && !post.isTranslation)
    .map(post => ({ post, date: parseDateLikeHugo(post.date), updated: parseDateLikeHugo(post.updated) }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const latest = published.reduce((time, { updated }) => Math.max(time, updated.getTime()), 0);
  const feed = create('feed', { version: '1.0', encoding: 'utf-8', standalone: false })
    .att({ xmlns: 'http://www.w3.org/2005/Atom', 'xml:base': base })
    .instructionBefore('xml-stylesheet', 'type="text/xsl" href="/atom.xsl"');
  feed.ele('title').txt(`${site.title} ATOM`);
  feed.ele('link', { href: new URL('/atom.xml', base).toString(), rel: 'self', type: 'application/atom+xml' });
  feed.ele('author').ele('name').txt(site.author);
  feed.ele('updated').txt(formatUtc(new Date(latest)));
  feed.ele('id').txt(legacyAtomId(base));

  for (const { post, date, updated } of published) {
    const entry = feed.ele('entry');
    entry.ele('title').txt(post.title);
    entry.ele('link', { rel: 'alternate', type: 'text/html', href: new URL(`/posts/${post.slug}/`, base).toString() });
    // Readers use this ID to track existing entries; the old permalink must remain.
    entry.ele('id').txt(legacyAtomId(new URL(`/posts/${post.slug}/index.jsx`, base).toString()));
    entry.ele('published').txt(date.toISOString());
    entry.ele('updated').txt(updated.toISOString());
    const category = post.category?.trim();
    if (category) entry.ele('category', { term: category, scheme: new URL('/category', base).toString(), label: category });
    for (const tag of post.tags) {
      entry.ele('category', { term: tag, scheme: new URL('/tag', base).toString(), label: tag });
    }
    const summary = post.encrypted ? encryptedNotice : post.summary.trim() || post.title.trim();
    entry.ele('summary').txt(summary);
    if (post.encrypted) {
      entry.ele('content', { type: 'text' }).txt(encryptedNotice);
    } else {
      const cover = resolveOgImageUrl({ baseURL: base, slug: post.slug });
      const coverHtml = cover
        ? create('p', { headless: true }).ele('img', { src: cover, alt: 'cover' }).end({ spaceBeforeSlash: true })
        : '';
      entry.ele('content', { type: 'html' }).txt(coverHtml + post.html);
    }
  }
  return feed.end({ pretty: true }) + '\n';
}
