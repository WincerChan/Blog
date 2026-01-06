import matter from "gray-matter";
import { defineLoader } from "velite";

const BOM_RE = /^\uFEFF/;

const normalizeFrontmatter = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => normalizeFrontmatter(item));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = normalizeFrontmatter(item);
    }
    return out;
  }
  return value;
};

export const matterLoader = defineLoader({
  test: /\.(md|mdx)$/,
  load: async (file) => {
    const value = file.toString().replace(BOM_RE, "").trim();
    const parsed = matter(value, {
      excerpt: true,
      excerpt_separator: "<!--more-->",
    });
    return {
      data: normalizeFrontmatter(parsed.data ?? {}),
      content: String(parsed.content ?? "").trim(),
    };
  },
});
