import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toc } from 'mdast-util-toc';
import { toHast } from 'mdast-util-to-hast';
import { raw } from 'hast-util-raw';
import { toString } from 'hast-util-to-string';
import { transforms } from './markdown';

// Metadata deliberately uses CommonMark, as the original content pipeline did.
// Rendering separately enables GFM/math without changing summaries or word counts.
export function markdownMetadata(content: string) {
  const tree = unified().use(remarkParse).parse(content);
  const visit = (node: any, fn: (node: any) => void) => {
    fn(node);
    node.children?.forEach((child: any) => visit(child, fn));
  };
  const parseToc = (list: any): Array<{ title: string; url: string; items: any[] }> => {
    if (list?.type !== 'list') return [];
    const layer = list.children.flatMap((item: any) => item.children);
    return layer.flatMap((node: any, index: number) => {
      if (node.type !== 'paragraph') return [];
      let title = '', url = '';
      visit(node, item => {
        if (item.type === 'link') url = item.url;
        if (['text', 'inlineCode'].includes(item.type)) title += item.value;
      });
      return [{ title, url, items: parseToc(layer[index + 1]) }];
    });
  };
  return {
    summary: transforms.summaryFromMeta({ mdast: tree, content }, 260),
    words: transforms.countWords(transforms.normalizeWhitespace(toString(raw(toHast(tree, { allowDangerousHtml: true }))))),
    toc: transforms.tocToHtml(parseToc(toc(tree, { maxDepth: 5 }).map)),
  };
}

// Parse inline HTML before the existing enhancement plugins, matching the old order.
export const rehypeParseHtml = () => (tree: any) => raw(tree);
// Article image URLs are already public. Keep their existing attributes and avoid
// Astro's image rewriting, which would otherwise require rendering <Content />.
export const rehypeKeepPublicImages = () => (_tree: unknown, file: any) => {
  file.data.astro.localImagePaths = [];
  file.data.astro.remoteImagePaths = [];
};
