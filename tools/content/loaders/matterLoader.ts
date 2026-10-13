import matter from "gray-matter";

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

export function parseMarkdown(value: string) {
  const parsed = matter(value.replace(BOM_RE, "").trim());
  return {
    data: normalizeFrontmatter(parsed.data ?? {}) as Record<string, unknown>,
    content: String(parsed.content ?? "").trim(),
  };
}
