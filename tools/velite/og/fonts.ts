import fs from "node:fs/promises";
import path from "node:path";

type OgFont = {
  name: string;
  data: Buffer;
  weight: number;
  style: "normal";
};

let cachedFonts: OgFont[] | null = null;

const loadFont = async (filePath: string, name: string, weight: number) => ({
  name,
  data: await fs.readFile(filePath),
  weight,
  style: "normal" as const,
});

export const loadOgFonts = async (repoRoot: string) => {
  if (cachedFonts) return cachedFonts;
  const fontsourceDir = path.join(repoRoot, "node_modules", "@fontsource");
  const fontsourceFile = (pkg: string, filename: string) =>
    path.join(fontsourceDir, pkg, "files", filename);
  cachedFonts = [
    await loadFont(
      fontsourceFile("lxgw-wenkai", "lxgw-wenkai-latin-500-normal.woff"),
      "LXGW WenKai",
      500
    ),
    await loadFont(
      fontsourceFile("lxgw-wenkai", "lxgw-wenkai-latin-700-normal.woff"),
      "LXGW WenKai",
      700
    ),
    await loadFont(
      fontsourceFile("fraunces", "fraunces-latin-500-normal.woff"),
      "Fraunces",
      500
    ),
    await loadFont(
      fontsourceFile("fraunces", "fraunces-latin-700-normal.woff"),
      "Fraunces",
      700
    ),
    await loadFont(
      fontsourceFile("ibm-plex-sans", "ibm-plex-sans-latin-400-normal.woff"),
      "IBM Plex Sans",
      400
    ),
    await loadFont(
      fontsourceFile("ibm-plex-sans", "ibm-plex-sans-latin-500-normal.woff"),
      "IBM Plex Sans",
      500
    ),
    await loadFont(
      fontsourceFile("ibm-plex-sans", "ibm-plex-sans-latin-700-normal.woff"),
      "IBM Plex Sans",
      700
    ),
  ];
  return cachedFonts;
};
