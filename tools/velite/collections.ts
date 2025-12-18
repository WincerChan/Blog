import { defineCollection, s } from "velite";
import { md, transforms } from "./markdown";

export const collections = {
  posts: defineCollection({
    name: "Post",
    pattern: "posts/**/*.md",
    schema: s.object({
      title: s.string(),
      subtitle: s.string().optional(),
      date: s.string(),
      updated: s.string().optional(),
      category: s.string().optional(),
      tags: s.array(s.any()).optional(),
      slug: s.string(),
      draft: s.boolean().optional(),
      private: s.boolean().optional(),
      cover: s.string().optional(),
      encrypt_pwd: s.string().optional(),
      mathrender: s.boolean().optional(),
      isTranslation: s.boolean().optional(),
      lang: s.string().optional(),
      html: s.markdown({
        copyLinkedFiles: false,
        removeComments: false,
        remarkPlugins: md.remarkPlugins,
        rehypePlugins: md.rehypePlugins,
      }),
      toc: s
        .toc({ maxDepth: 5 })
        .transform((entries) =>
          transforms.tocToHtml(Array.isArray(entries) ? (entries as any) : []),
        ),
      summary: s
        .raw()
        .transform((_, ctx) =>
          transforms.summaryFromMeta(transforms.getMetaFromZodCtx(ctx), 260),
        ),
      words: s.raw().transform((_, ctx) => {
        const meta = transforms.getMetaFromZodCtx(ctx);
        return transforms.countWords(
          transforms.normalizeWhitespace(String(meta?.plain ?? "")),
        );
      }),
    }),
  }),
  pages: defineCollection({
    name: "Page",
    pattern: ["pages/**/*.md", "page/**/*.md"],
    schema: s.object({
      title: s.string(),
      date: s.string(),
      updated: s.string().optional(),
      slug: s.string(),
      weight: s.number().optional(),
      draft: s.boolean().optional(),
      private: s.boolean().optional(),
      cover: s.string().optional(),
      isTranslation: s.boolean().optional(),
      lang: s.string().optional(),
      html: s.markdown({
        copyLinkedFiles: false,
        removeComments: false,
        remarkPlugins: md.remarkPlugins,
        rehypePlugins: md.rehypePlugins,
      }),
      toc: s
        .toc({ maxDepth: 5 })
        .transform((entries) =>
          transforms.tocToHtml(Array.isArray(entries) ? (entries as any) : []),
        ),
      summary: s
        .raw()
        .transform((_, ctx) =>
          transforms.summaryFromMeta(transforms.getMetaFromZodCtx(ctx), 260),
        ),
    }),
  }),
  friends: defineCollection({
    name: "Friend",
    pattern: "friends.json",
    schema: s.object({
      name: s.string(),
      url: s.string(),
      avatar: s.string().optional(),
      inactive: s.boolean().optional(),
    }),
  }),
};

