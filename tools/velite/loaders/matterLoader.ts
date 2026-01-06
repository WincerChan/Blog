import matter from "gray-matter";
import { defineLoader } from "velite";

const BOM_RE = /^\uFEFF/;

export const matterLoader = defineLoader({
  test: /\.(md|mdx)$/,
  load: async (file) => {
    const value = file.toString().replace(BOM_RE, "").trim();
    const parsed = matter(value, {
      excerpt: true,
      excerpt_separator: "<!--more-->",
    });
    return {
      data: parsed.data ?? {},
      content: String(parsed.content ?? "").trim(),
    };
  },
});
