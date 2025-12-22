import path from "node:path";
import { writeFile } from "../io";
import { postUrl } from "../shared";

type EmitValidPathsOptions = {
  publicDir: string;
  renderablePosts: any[];
  renderablePages: any[];
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
}: EmitValidPathsOptions) => {
  const paths = new Set<string>();

  for (const p of renderablePosts) {
    if (p?.isTranslation === true) continue;
    const slug = normalizeSlug(p?.slug);
    if (!slug) continue;
    paths.add(postUrl(slug));
  }

  for (const p of renderablePages) {
    if (p?.isTranslation === true) continue;
    const pathValue = toPagePath(p?.slug);
    if (!pathValue) continue;
    paths.add(pathValue);
  }

  const output = `${Array.from(paths).sort().join("\n")}\n`;
  await writeFile(path.join(publicDir, "valid_paths.txt"), output);
};
