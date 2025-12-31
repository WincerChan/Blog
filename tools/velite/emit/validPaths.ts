import path from "node:path";
import { writeFile } from "../io";
import { postUrl } from "../shared";

type EmitValidPathsOptions = {
  publicDir: string;
  renderablePosts: any[];
  renderablePages: any[];
  publishedPosts: any[];
};

const normalizeSlug = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");

const toPagePath = (slug: unknown) => {
  const value = normalizeSlug(slug);
  if (!value) return "";
  return `/${value}/`;
};

export const emitValidPaths = async ({
  publicDir,
  renderablePosts,
  renderablePages,
  publishedPosts,
}: EmitValidPathsOptions) => {
  const paths = new Set<string>(["/"]);

  for (const p of renderablePosts) {
    const slug = normalizeSlug(p?.slug);
    if (!slug) continue;
    paths.add(postUrl(slug));
  }

  for (const p of renderablePages) {
    const pathValue = toPagePath(p?.slug);
    if (!pathValue) continue;
    paths.add(pathValue);
  }

  const categories = new Set<string>();
  for (const p of publishedPosts) {
    const category = String(p?.category ?? "").trim();
    if (!category) continue;
    categories.add(category);
  }
  for (const category of categories) {
    paths.add(`/category/${encodeURIComponent(category)}/`);
  }

  const output = `${Array.from(paths).sort().join("\n")}\n`;
  await writeFile(path.join(publicDir, "valid_paths.txt"), output);
};
