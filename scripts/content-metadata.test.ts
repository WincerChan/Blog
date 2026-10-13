import { expect, test } from 'bun:test';
import { markdownMetadata } from '../tools/content/metadata';
import { parseMarkdown } from '../tools/content/loaders/matterLoader';

test('frontmatter preserves date normalization and BOM handling', () => {
  const result = parseMarkdown('\uFEFF---\ndate: 2024-01-01\nslug: sample\n---\n\nHello\n');
  expect(result.data.date).toBe('2024-01-01T00:00:00.000Z');
  expect(result.content).toBe('Hello');
});

test('summary stops at more while word counts exclude HTML tags and image alt text', () => {
  const result = markdownMetadata('Hello **world**\n\n<!-- more -->\n\n<span>你好</span>\n\n![Not counted](https://example.com/a.png)');
  expect(result.summary).toBe('Hello world');
  expect(result.words).toBe(4);
});

test('TOC retains nested heading structure, duplicate anchors and depth limit', () => {
  const result = markdownMetadata('## Hello\n\n### Code `x`\n\n## Hello\n\n###### Omitted');
  expect(result.toc).toBe('<nav id="TableOfContents"><ul><li><a href="#hello">Hello</a><ul><li><a href="#code-x">Code x</a></li></ul></li><li><a href="#hello-1">Hello</a></li></ul></nav>');
});
