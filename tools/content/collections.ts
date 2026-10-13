import { z } from 'astro/zod';

const baseFields = {
  title: z.string(), date: z.string(), updated: z.string(),
  slug: z.string().min(1).refine(value => !/[\\/]/.test(value) && !['.', '..'].includes(value), 'Expected a single URL segment'),
  draft: z.boolean().optional(), cover: z.string().optional(),
  isTranslation: z.boolean().optional(), lang: z.string().optional(),
};
export const postInput = z.object({
  ...baseFields, subtitle: z.string().optional(), category: z.string().optional(),
  tags: z.array(z.unknown()).optional(), encrypt_pwd: z.string().optional(),
});
export const pageInput = z.object({ ...baseFields, weight: z.number().optional() });
export const friendInput = z.object({
  name: z.string(), url: z.string(), avatar: z.string().optional(), inactive: z.boolean().optional(),
});
const renderedFields = { html: z.string(), toc: z.string(), summary: z.string(), url: z.string(), inkstoneToken: z.string() };
const link = z.object({ title: z.string(), slug: z.string() });
export const publicPost = postInput.omit({ encrypt_pwd: true }).extend({
  ...renderedFields, tags: z.array(z.string()), words: z.number(), encrypted: z.boolean(), hasMath: z.boolean(),
  discussionUrl: z.string().optional(),
  neighbours: z.object({ prev: link.optional(), next: link.optional() }),
  relates: z.array(link.extend({ date: z.string(), score: z.number() })),
});
export const publicPage = pageInput.extend(renderedFields);
const postMeta = postInput.omit({ encrypt_pwd: true }).extend({
  url: z.string(), words: z.number(), summary: z.string().optional(), tags: z.array(z.string()),
});
const listing = z.object({ inkstoneToken: z.string(), items: z.array(postMeta) });
const siteSchema = z.object({
  latest: listing,
  categories: z.array(z.object({ title: z.string(), count: z.number(), url: z.string() })),
  categoryData: z.record(z.string(), listing),
  friends: z.array(friendInput),
});
// One collection owns publication atomically: related posts, taxonomy and assets
// must be derived from the same source revision as the article entries.
export const blogSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('post'), value: publicPost }),
  z.object({ kind: z.literal('page'), value: publicPage }),
  z.object({ kind: z.literal('site'), value: siteSchema }),
]);
