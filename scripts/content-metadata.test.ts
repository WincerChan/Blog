import { expect, test } from 'bun:test';
import { renderedMetadata } from '../tools/content/metadata';
import { markdownOptions } from '../tools/content/markdown';
import { parseMarkdown } from '../tools/content/frontmatter';
const renderer = await markdownOptions.processor.createRenderer(markdownOptions);
const metadata = async (source: string) => renderedMetadata((await renderer.render(source)).metadata, true);

test('frontmatter preserves date normalization and BOM handling', () => {
  const result = parseMarkdown('\uFEFF---\ndate: 2024-01-01\nslug: sample\n---\n\nHello\n');
  expect(result.data.date).toBe('2024-01-01T00:00:00.000Z');
  expect(result.content).toBe('Hello');
});

test('summary stops at more while word counts exclude HTML tags and image alt text', async () => {
  const result = await metadata('Hello **world**\n\n<!-- more -->\n\n<span>你好</span>\n\n![Not counted](https://example.com/a.png)');
  expect(result.summary).toBe('Hello world');
  expect(result.words).toBe(4);
});

test('TOC retains nested heading structure, duplicate anchors and depth limit', async () => {
  const result = await metadata('## Hello\n\n### Code `x`\n\n## Hello\n\n###### Omitted');
  expect(result.toc).toBe('<nav id="TableOfContents"><ul><li><a href="#hello">Hello</a><ul><li><a href="#code-x">Code x</a></li></ul></li><li><a href="#hello-1">Hello</a></li></ul></nav>');
});

test('uses Astro heading IDs, escapes TOC text and omits generated footnote heading', async () => {
  const result = await renderer.render('## A & B\n\nText[^n]\n\n## A & B\n\n[^n]: Note');
  const data = renderedMetadata(result.metadata);
  expect(data.toc).toContain('href="#a--b">A &amp; B');
  expect(data.toc).toContain('href="#a--b-1"');
  expect(data.toc).not.toContain('footnote-label');
  expect(result.code).toContain('id="a--b-1"');
});

test('counts rendered table cells, inline HTML and footnote content without controls', async () => {
  const data = await metadata('Hello<span>world</span>[^n]\n\n| One | Two |\n| --- | --- |\n| Three | Four |\n\n[^n]: Note');
  expect(data.words).toBe(6); // Helloworld + four cells + Note
  expect(data.searchText).toContain('One Two Three Four');
});

test('metadata keeps TeX source and strips GFM syntax without reparsing the body', async () => {
  const data = await metadata('Hello ~~world~~\n\n<!--more-->\n\n$$\na + b\n$$');
  expect(data.summary).toBe('Hello world');
  expect(data.searchText).toContain('$$ a + b $$');
  expect(data.words).toBe(4);
  expect(data.searchText).not.toContain('katex');
});

test('Astro highlighter preserves semantic colors, copyable code and language labels', async () => {
  const result = await renderer.render('```ts\nconst x = 1;\n```\n\n```unknown-fixture-lang\nplain text\n```');
  expect(result.code).toContain('class="code-block" data-lang="ts"');
  expect(result.code).toContain('var(--code-keyword)');
  expect(result.code).toContain('plain text');
  expect(result.code).toContain('data-lang="plaintext"');
});
