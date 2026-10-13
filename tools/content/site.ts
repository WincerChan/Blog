import fs from "node:fs/promises";
import path from "node:path";

export type SiteConf = {
  baseURL: string;
  title: string;
  description: string;
  author: string;
  sitemap: { changeFreq: string; priority: number; termPriority: number };
};

export const readSiteConf = async (repoRoot: string): Promise<SiteConf> => {
  const raw = await fs.readFile(path.join(repoRoot, "site.config.json"), "utf8");
  const cfg = JSON.parse(raw);
  return {
    baseURL: String(cfg.baseURL ?? "").replace(/\/$/, ""),
    title: String(cfg.title ?? ""),
    description: String(cfg.description ?? ""),
    author: String(cfg.author?.name ?? cfg.author ?? ""),
    sitemap: {
      changeFreq: String(cfg.sitemap?.changeFreq ?? "weekly"),
      priority: Number(cfg.sitemap?.priority ?? 0.6),
      termPriority: Number(cfg.sitemap?.termPriority ?? 0.3),
    },
  };
};

