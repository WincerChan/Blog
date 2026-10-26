import { unified, type MarkdownHeading, type MarkdownRenderer } from '@astrojs/markdown-remark';
import { raw } from 'hast-util-raw';
import { toText } from 'hast-util-to-text';

const MORE_MARKER_RE = /<!--\s*more\s*-->/i;
const normalizeWhitespace = (value: string) => String(value ?? '').replace(/\s+/g, ' ').trim();
const countWords = (value: string) => {
  const text = value.normalize('NFKC');
  return (text.match(/\p{Script=Han}/gu) ?? []).length
    + (text.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) ?? []).length;
};
const splitCjkLatinText = (value: string) => {
  const text = String(value ?? '').normalize('NFKC');
  return {
    cjk: (text.match(/\p{Script=Han}/gu) ?? []).join(''),
    latin: (text.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) ?? []).join(' '),
  };
};

// Read the AST Astro already parsed. Keep the site's summary/search rules:
// include code and image alt text, stop summaries at <!--more-->, retain TeX.
const plainFromTree = (tree: any, source: string, stopAtMore = false) => {
  const parts: string[] = [];
  let done = false;
  const visit = (node: any) => {
    if (done) return;
    if (node.type === 'html') {
      if (MORE_MARKER_RE.test(node.value)) {
        if (stopAtMore) done = true;
        return;
      }
      parts.push(String(node.value).replace(/<[^>]*>/g, ' '));
    } else if (['text', 'inlineCode', 'code'].includes(node.type)) parts.push(node.value);
    else if (node.type === 'image' && node.alt) parts.push(node.alt);
    else if (['math', 'inlineMath'].includes(node.type)) {
      parts.push(source.slice(node.position.start.offset, node.position.end.offset));
    }
    node.children?.forEach(visit);
  };
  visit(tree);
  return normalizeWhitespace(parts.reduce((text, value) => {
    const part = String(value ?? '').trim();
    return part ? text + (text && !/^[.,;:!?)]/.test(part) ? ' ' : '') + part : text;
  }, ''));
};

export const remarkBlogMetadata = () => (tree: any, file: any) => {
  file.data.astro ??= {};
  file.data.astro.frontmatter ??= {};
  file.data.astro.frontmatter.blog = {
    summary: plainFromTree(tree, String(file.value), true).slice(0, 260),
    searchText: plainFromTree(tree, String(file.value)),
  };
};

// Count before KaTeX and blog decorations add presentational content. Parse raw
// HTML here so images/tables and inline HTML receive the same enhancements.
export const rehypeBlogMetadata = () => (tree: any, file: any) => {
  const parsed = raw(tree);
  // GFM footnote controls are navigation, not article words. toText supplies
  // block/table separators so adjacent cells never merge into one word.
  const forCounting = (node: any): any => {
    const props = node.properties ?? {};
    if ('dataFootnoteRef' in props || 'dataFootnoteBackref' in props || props.id === 'footnote-label') return null;
    if (!node.children) return node;
    const children = node.children.map(forCounting).filter(Boolean);
    // HTML parsing moves table whitespace outside the table; keep a boundary
    // between header/body rows when extracting their visible text.
    if (node.tagName === 'tr') children.push({ type: 'text', value: '\n' });
    return { ...node, children };
  };
  file.data.astro.frontmatter.blog.words = countWords(normalizeWhitespace(toText(forCounting(parsed))));
  return parsed;
};

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// IDs and heading text come from Astro. This only shapes its flat heading list
// into the existing nested navigation markup, with the site's depth limit.
export function tocFromHeadings(headings: MarkdownHeading[]) {
  type Item = MarkdownHeading & { children: Item[] };
  const roots: Item[] = [], stack: Item[] = [];
  for (const heading of headings) {
    if (heading.depth > 5 || heading.slug === 'footnote-label') continue;
    while (stack.length && stack.at(-1)!.depth >= heading.depth) stack.pop();
    const item = { ...heading, children: [] };
    (stack.at(-1)?.children ?? roots).push(item);
    stack.push(item);
  }
  const list = (items: Item[]): string => '<ul>' + items.map(item =>
    `<li><a href="#${escapeHtml(item.slug)}">${escapeHtml(item.text)}</a>${item.children.length ? list(item.children) : ''}</li>`).join('') + '</ul>';
  return roots.length ? `<nav id="TableOfContents">${list(roots)}</nav>` : '';
}

export function renderedMetadata(metadata: { headings?: MarkdownHeading[]; frontmatter?: Record<string, any> } | undefined, includeSearchText = false) {
  const blog = metadata?.frontmatter?.blog;
  if (!blog || typeof blog.summary !== 'string' || typeof blog.searchText !== 'string' || typeof blog.words !== 'number') {
    throw new Error('Astro Markdown renderer did not return blog metadata');
  }
  return {
    summary: blog.summary as string, words: blog.words as number,
    toc: tocFromHeadings(metadata?.headings ?? []),
    ...(includeSearchText ? { searchText: blog.searchText as string } : {}),
  };
}

// Short frontmatter titles/subtitles are Markdown too. Use Astro's public
// processor, without body rendering plugins; never parse an article twice.
let textProcessor: Promise<MarkdownRenderer> | undefined;
async function plainFromMarkdown(source: string) {
  if (!source.trim()) return '';
  textProcessor ??= unified({ gfm: false, smartypants: false, remarkPlugins: [remarkBlogMetadata] })
    .createRenderer({ syntaxHighlight: false });
  const result = await (await textProcessor).render(source);
  return result.metadata.frontmatter.blog.searchText as string;
}
export const transforms = { plainFromMarkdown, splitCjkLatinText };

// Article URLs are already public. Keep their attributes and skip Astro's
// image rewriting, which expects pages to render a <Content /> component.
export const rehypeKeepPublicImages = () => (_tree: unknown, file: any) => {
  file.data.astro.localImagePaths = [];
  file.data.astro.remoteImagePaths = [];
};
