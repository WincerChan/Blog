import fs from "node:fs/promises";
import path from "node:path";

export type OgFont = {
  name: string;
  data: Buffer;
  weight: number;
  style: "normal";
};

const fontSource = (filePath: string, name: string, weight: number) => ({
  name,
  path: filePath,
  weight,
  style: "normal" as const,
});

export const ogFontSources = (repoRoot: string) => {
  const fontsourceDir = path.join(repoRoot, "node_modules", "@fontsource");
  const fontsourceFile = (pkg: string, filename: string) =>
    path.join(fontsourceDir, pkg, "files", filename);
  return [
    fontSource(
      fontsourceFile("lxgw-wenkai", "lxgw-wenkai-latin-500-normal.woff"),
      "LXGW WenKai",
      500
    ),
    fontSource(
      fontsourceFile("lxgw-wenkai", "lxgw-wenkai-latin-700-normal.woff"),
      "LXGW WenKai",
      700
    ),
    fontSource(
      fontsourceFile("fraunces", "fraunces-latin-500-normal.woff"),
      "Fraunces",
      500
    ),
    fontSource(
      fontsourceFile("fraunces", "fraunces-latin-700-normal.woff"),
      "Fraunces",
      700
    ),
    fontSource(
      fontsourceFile("ibm-plex-sans", "ibm-plex-sans-latin-400-normal.woff"),
      "IBM Plex Sans",
      400
    ),
    fontSource(
      fontsourceFile("ibm-plex-sans", "ibm-plex-sans-latin-500-normal.woff"),
      "IBM Plex Sans",
      500
    ),
    fontSource(
      fontsourceFile("ibm-plex-sans", "ibm-plex-sans-latin-700-normal.woff"),
      "IBM Plex Sans",
      700
    ),
  ];
};

export const loadOgFonts = async (repoRoot: string): Promise<OgFont[]> =>
  Promise.all(ogFontSources(repoRoot).map(async ({ path: filePath, ...font }) => ({
    ...font, data: await fs.readFile(filePath),
  })));
