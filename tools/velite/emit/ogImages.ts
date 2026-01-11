import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import type { SiteConf } from "../site";
import { parseDateLikeHugo } from "../time";
import { loadOgFonts } from "../og/fonts";
import { ogImageFilename } from "../og/paths";
import { renderPng } from "../og/resvg";
import { renderOgSvg } from "../og/template";

export const OG_PNG_SCALE = 1.5;
const DEFAULT_OG_RENDER_CONCURRENCY = 2;

const formatDate = (value?: Date | string) => {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const parsed = parseDateLikeHugo(String(value ?? ""));
  if (!Number.isFinite(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "");

const hasCjk = (value: string) => /[\u1100-\u115F\u2E80-\u9FFF\uAC00-\uD7A3\uF900-\uFAFF]/.test(value);

const resolveSubtitle = (post: any) => {
  const subtitle = String(post.subtitle ?? "").trim();
  if (subtitle) return subtitle;
  const summary = stripHtml(String(post.summary ?? "").trim());
  if (!summary) return "";
  if (summary === String(post.title ?? "").trim()) return "";
  return summary;
};

export const resolveTitleFontFamily = (post: any, title: string) => {
  const lang = String(post?.lang ?? "").trim().toLowerCase();
  const isEnglish = lang.startsWith("en");
  if (!isEnglish) return "LXGW WenKai, serif";
  if (hasCjk(title)) return "LXGW WenKai, serif";
  return "Fraunces, serif";
};

export const resolveSubtitleFontFamily = (post: any, subtitle: string) => {
  const lang = String(post?.lang ?? "").trim().toLowerCase();
  const isEnglish = lang.startsWith("en");
  if (!isEnglish) return "LXGW WenKai, serif";
  if (hasCjk(subtitle)) return "LXGW WenKai, serif";
  return "IBM Plex Sans, sans-serif";
};

const resolveSiteName = (site: SiteConf) => {
  const author = String(site.author ?? "").trim();
  if (author) return `${author}.Blog`;
  return String(site.title ?? "").trim() || "Blog";
};

const resolveSiteHost = (site: SiteConf) => {
  try {
    return new URL(site.baseURL).host || site.baseURL;
  } catch {
    return site.baseURL;
  }
};

const clearOutDir = async (targetDir: string) => {
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });
};

const resolveConcurrency = () => {
  const raw = Number.parseInt(
    process.env.OG_RENDER_CONCURRENCY ?? String(DEFAULT_OG_RENDER_CONCURRENCY),
    10
  );
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return raw;
};

const runWithConcurrency = async <T,>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
) => {
  const executing = new Set<Promise<void>>();

  for (const item of items) {
    const task = worker(item);
    executing.add(task);
    task.finally(() => {
      executing.delete(task);
    });
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
};

export const emitOgImages = async ({
  site,
  publicDir,
  posts,
  repoRoot,
}: {
  site: SiteConf;
  publicDir: string;
  posts: any[];
  repoRoot: string;
}) => {
  const outDir = path.join(publicDir, "og");
  await clearOutDir(outDir);

  const concurrency = resolveConcurrency();
  const fonts = await loadOgFonts(repoRoot);
  const siteName = resolveSiteName(site);
  const siteHost = resolveSiteHost(site);

  const ogPosts = posts.filter((post) => post?.draft !== true);

  await runWithConcurrency(ogPosts, concurrency, async (post) => {
    const slug = String(post.slug ?? "").trim();
    if (!slug) return;
    const title = String(post.title ?? "").trim() || "Untitled";
    const subtitle = resolveSubtitle(post);
    const date = formatDate(post.dateObj ?? post.date);
    const titleFontFamily = resolveTitleFontFamily(post, title);
    const subtitleFontFamily = resolveSubtitleFontFamily(post, subtitle);

    try {
      const renderSvg = async () => {
        const svgStart = performance.now();
        const svg = await renderOgSvg({
          title,
          subtitle,
          date,
          siteName,
          siteHost,
          showDate: true,
          titleFontFamily,
          subtitleFontFamily,
          fonts,
        });
        const svgDuration = performance.now() - svgStart;
        return { svg, svgDuration };
      };

      const renderPngWithTiming = async (svg: string) => {
        const pngStart = performance.now();
        const png = await renderPng(svg, { scale: OG_PNG_SCALE });
        const pngDuration = performance.now() - pngStart;
        return { png, pngDuration };
      };

      const { svg, svgDuration } = await renderSvg();
      const { png, pngDuration } = await renderPngWithTiming(svg);
      await fs.writeFile(path.join(outDir, ogImageFilename(slug)), png);
      console.log(
        `[velite] og-image ${slug}: satori ${svgDuration.toFixed(1)}ms resvg ${pngDuration.toFixed(1)}ms`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`[velite] OG image failed for "${slug}": ${message}`);
    }
  });
};
