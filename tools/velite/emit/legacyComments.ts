import fs from "node:fs/promises";
import path from "node:path";
import { safePathSegment } from "../shared";

type LegacyCommentsMap = Record<string, unknown>;

const readLegacyComments = async (sourcePath: string): Promise<LegacyCommentsMap | null> => {
  try {
    const raw = await fs.readFile(sourcePath, "utf8");
    return JSON.parse(raw) as LegacyCommentsMap;
  } catch {
    return null;
  }
};

const legacyCommentsPath = (repoRoot: string) =>
  path.join(repoRoot, "_blogs", "content", "legacy-comments.json");

const toNormalizedPath = (rawPath: string) => {
  let pathname = String(rawPath || "");
  if (/^https?:\/\//.test(pathname)) {
    try {
      pathname = new URL(pathname).pathname;
    } catch {
      // ignore invalid URLs and fallback to raw
    }
  }
  pathname = pathname.split("?")[0].split("#")[0];
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  if (!pathname.endsWith("/")) pathname = `${pathname}/`;
  return pathname;
};

const toPathSegments = (rawPath: string) => {
  let pathname = String(rawPath || "");
  if (/^https?:\/\//.test(pathname)) {
    try {
      pathname = new URL(pathname).pathname;
    } catch {
      // ignore invalid URLs and fallback to raw
    }
  }
  pathname = pathname.split("?")[0].split("#")[0];
  const parts = pathname.split("/").filter(Boolean).map(safePathSegment);
  return parts.length ? parts : null;
};

export const loadLegacyCommentsMap = async (repoRoot: string) =>
  readLegacyComments(legacyCommentsPath(repoRoot));

export const collectLegacyCommentPaths = (comments: LegacyCommentsMap) => {
  const paths = new Set<string>();
  for (const [rawPath, thread] of Object.entries(comments)) {
    if (!Array.isArray(thread) || thread.length === 0) continue;
    paths.add(toNormalizedPath(rawPath));
  }
  return paths;
};

export const emitLegacyComments = async ({
  repoRoot,
  publicDir,
  commentsMap,
}: {
  repoRoot: string;
  publicDir: string;
  commentsMap?: LegacyCommentsMap | null;
}) => {
  const comments = commentsMap ?? (await loadLegacyCommentsMap(repoRoot));
  if (!comments) return;

  const outDir = path.join(publicDir, "_data", "legacy-comments");
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  for (const [rawPath, thread] of Object.entries(comments)) {
    if (!Array.isArray(thread) || thread.length === 0) continue;
    const parts = toPathSegments(rawPath);
    if (!parts) continue;
    const filePath = path.join(outDir, ...parts) + ".json";
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(thread), "utf8");
  }
};
