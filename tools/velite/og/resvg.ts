import { existsSync } from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

type RenderPngOptions = {
  width?: number; // base width, default 1200
  scale?: number; // default 1
};

const FONT_FILES = [
  "lxgw-wenkai/files/lxgw-wenkai-latin-500-normal.woff",
  "lxgw-wenkai/files/lxgw-wenkai-latin-700-normal.woff",
  "fraunces/files/fraunces-latin-500-normal.woff",
  "fraunces/files/fraunces-latin-700-normal.woff",
  "ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff",
  "ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff",
  "ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff",
];

let cachedFontFiles: string[] | null = null;

export const resolveResvgFontFiles = (repoRoot: string) => {
  if (cachedFontFiles) return cachedFontFiles;
  const baseDir = path.join(repoRoot, "node_modules", "@fontsource");
  const resolved = FONT_FILES.map((file) => path.join(baseDir, file)).filter((file) =>
    existsSync(file)
  );
  cachedFontFiles = resolved;
  return resolved;
};

export const renderPng = async (svg: string, opts: RenderPngOptions = {}) => {
  const baseWidth = opts.width ?? 1200;
  const scale = opts.scale ?? 1;
  const targetWidth = Math.round(baseWidth * scale);
  const fontFiles = resolveResvgFontFiles(process.cwd());

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: targetWidth },
    fontFiles,
    loadSystemFonts: false,
  });

  return resvg.render().asPng();
};
