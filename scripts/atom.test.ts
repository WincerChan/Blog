import { expect, test } from 'bun:test';
import { parser } from 'sax';
import { buildAtom } from '../tools/content/atom';

const site = { baseURL: 'https://example.com', title: 'Site', author: 'Author', description: '',
  sitemap: { changeFreq: 'weekly', priority: 0.6, termPriority: 0.3 } };
const post = { title: 'Article', slug: 'article', category: '分类',
  date: '2020-01-01', updated: '2021-02-03', html: '<p>Hello</p>', summary: 'Hello',
  tags: ['Tag'], encrypted: false };

type Element = { name: string; attributes: Record<string, string>; text: string; children: Element[] };
function parse(xml: string): Element {
  const root: Element = { name: '', attributes: {}, text: '', children: [] };
  const stack = [root];
  const reader = parser(true);
  reader.onopentag = tag => {
    const element = { name: tag.name, attributes: tag.attributes as Record<string, string>, text: '', children: [] };
    stack.at(-1)!.children.push(element);
    stack.push(element);
  };
  reader.ontext = text => { stack.at(-1)!.text += text; };
  reader.onclosetag = () => { stack.pop(); };
  reader.write(xml).close();
  return root.children[0];
}
const child = (element: Element, name: string) => element.children.find(node => node.name === name)!;
const entries = (feed: Element) => feed.children.filter(node => node.name === 'entry');

test('Atom keeps historical IDs, canonical links, XSL and content dates', () => {
  const xml = buildAtom({ site, posts: [post] });
  const feed = parse(xml);
  const entry = entries(feed)[0];
  expect(xml).toContain('<?xml-stylesheet type="text/xsl" href="/atom.xsl"?>');
  expect(feed.attributes).toEqual({ xmlns: 'http://www.w3.org/2005/Atom', 'xml:base': 'https://example.com/' });
  expect(child(feed, 'id').text).toBe('urn:uuid:b559c7ed-d3fb-5737-49c1-5e739cdd7edd');
  expect(child(entry, 'id').text).toBe('urn:uuid:791ff42b-f0bb-583b-f925-819cbe8a392e');
  expect(child(feed, 'link').attributes).toEqual({ href: 'https://example.com/atom.xml', rel: 'self', type: 'application/atom+xml' });
  expect(child(entry, 'link').attributes).toEqual({ href: 'https://example.com/posts/article/', rel: 'alternate', type: 'text/html' });
  expect(child(feed, 'updated').text).toBe('2021-02-02T16:00:00Z');
  expect(child(entry, 'published').text).toBe('2019-12-31T16:00:00.000Z');
  expect(child(entry, 'updated').text).toBe('2021-02-02T16:00:00.000Z');
});

test('Atom preserves literal text, HTML entities, category attributes and the OG cover', () => {
  const text = `A & B <tag> "quoted" 'text' &lt;literal&gt; ]]> 中文`;
  const html = '<p><code>&lt;script&gt; &amp; &#39; &nbsp; ]]&gt;</code><a href="/a?x=1&amp;y=2">link</a></p>';
  const feed = parse(buildAtom({ site: { ...site, title: text, author: text },
    posts: [{ ...post, title: text, summary: `  ${text}  `, html, category: text, tags: [text] }],
  }));
  const entry = entries(feed)[0];
  expect(child(feed, 'title').text).toBe(`${text} ATOM`);
  expect(child(child(feed, 'author'), 'name').text).toBe(text);
  expect(child(entry, 'title').text).toBe(text);
  expect(child(entry, 'summary').text).toBe(text);
  expect(child(entry, 'title').attributes.type ?? 'text').toBe('text');
  expect(child(entry, 'summary').attributes.type ?? 'text').toBe('text');
  expect(child(entry, 'content').attributes.type).toBe('html');
  expect(child(entry, 'content').text).toBe(`<p><img src="https://example.com/og/article.png" alt="cover" /></p>${html}`);
  expect(entry.children.filter(node => node.name === 'category').map(node => node.attributes)).toEqual([
    { term: text, label: text, scheme: 'https://example.com/category' },
    { term: text, label: text, scheme: 'https://example.com/tag' },
  ]);
});

test('Atom excludes drafts and translations, sorts publication dates and remains deterministic', () => {
  const input = [post,
    { ...post, slug: 'draft', draft: true, updated: '2099-01-01' },
    { ...post, slug: 'article-en', isTranslation: true, updated: '2099-01-01' },
    { ...post, slug: 'newer', title: '  Newer  ', summary: '  ', date: '2022-01-01', updated: '2023-01-01' },
  ];
  const xml = buildAtom({ site, posts: input });
  const feed = parse(xml);
  expect(entries(feed).map(entry => child(entry, 'title').text)).toEqual(['  Newer  ', 'Article']);
  expect(child(entries(feed)[0], 'summary').text).toBe('Newer');
  expect(child(feed, 'updated').text).toBe('2022-12-31T16:00:00Z');
  expect(buildAtom({ site, posts: input })).toBe(xml);
  expect(input[0]).toBe(post);
  const empty = parse(buildAtom({ site, posts: [] }));
  expect(entries(empty)).toEqual([]);
  expect(child(empty, 'updated').text).toBe('1970-01-01T00:00:00Z');
});

test('encrypted Atom entries expose only a plaintext notice, never HTML or summary', () => {
  const xml = buildAtom({ site, posts: [{ ...post, encrypted: true,
    html: 'PRIVATE_BODY_OR_CIPHERTEXT_SENTINEL', summary: 'PRIVATE_SUMMARY_SENTINEL' }] });
  const entry = entries(parse(xml))[0];
  expect(xml).not.toContain('PRIVATE_');
  expect(xml).not.toContain('/og/');
  expect(child(entry, 'summary').text).toBe('抱歉，本文已加密，请至网站输入密码后阅读。');
  expect(child(entry, 'content').text).toBe(child(entry, 'summary').text);
  expect(child(entry, 'content').attributes.type).toBe('text');
});

test('invalid XML characters and malformed dates fail generation', () => {
  expect(() => buildAtom({ site, posts: [{ ...post, title: 'invalid\u0000character' }] })).toThrow();
  expect(() => buildAtom({ site, posts: [{ ...post, updated: 'not-a-date' }] })).toThrow();
});
