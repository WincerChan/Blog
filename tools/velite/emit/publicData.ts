import fs from "node:fs/promises";
import path from "node:path";
import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import {
  byDateDesc,
  canonicalPosts,
  computeNeighbours,
  computeRelated,
  postMeta,
  postUrl,
  safePathSegment,
  visiblePages,
  visiblePosts,
} from "../shared";

const ENCRYPTION_VERSION = "v1";
const PBKDF2_ITERATIONS = 120000;
const KEY_BYTES = 32;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const encryptHtml = (pwd: string, html: string) => {
  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);
  const key = pbkdf2Sync(String(pwd ?? ""), salt, PBKDF2_ITERATIONS, KEY_BYTES, "sha256");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(html, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  const saltB64 = salt.toString("base64");
  const ivB64 = iv.toString("base64");
  const tagB64 = tag.toString("base64");
  const payloadB64 = encrypted.toString("base64");

  return `${ENCRYPTION_VERSION}:${saltB64}:${ivB64}:${tagB64}:${payloadB64}`;
};

type EmitPublicDataOptions = {
  publicDir: string;
  posts: any[];
  pages: any[];
  friends?: any[];
  clear?: boolean;
};

const writeJson = async (filepath: string, data: unknown) => {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, JSON.stringify(data), "utf8");
};

const clearOutDir = async (targetDir: string) => {
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });
};

const buildCategoryOutputs = async ({ canon, outDir }: { canon: any[]; outDir: string }) => {
  const categoryIndex: Array<{ title: string; count: number; url: string }> = [];
  const byCategory = new Map<string, any[]>();
  for (const p of canon) {
    const c = String(p.category ?? "");
    if (!c) continue;
    const list = byCategory.get(c) ?? [];
    list.push(p);
    byCategory.set(c, list);
  }

  for (const [title, list] of Array.from(byCategory.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const data = byDateDesc(list).map((p) => postMeta(p, { includeSummary: true }));
    await writeJson(path.join(outDir, "category", `${safePathSegment(title)}.json`), data);
    categoryIndex.push({ title, count: list.length, url: `/category/${encodeURIComponent(title)}/` });
  }
  await writeJson(path.join(outDir, "category", "index.json"), categoryIndex);
};

const buildPostOutputs = async ({
  visPosts,
  canon,
  canonSlugSet,
  slugToPost,
  outDir,
}: {
  visPosts: any[];
  canon: any[];
  canonSlugSet: Set<string>;
  slugToPost: Map<string, any>;
  outDir: string;
}) => {
  for (const p of visPosts) {
    const slug = String(p.slug);
    const neighbours = computeNeighbours(p, { canon, canonSlugSet, slugToPost });
    const relates = computeRelated(p, canon);
    const html = String(p.html ?? "");
    const encryptPwd = String(p.encrypt_pwd ?? "");
    const encrypted = !!encryptPwd;
    const content = encrypted ? encryptHtml(encryptPwd, html) : html;
    const hasMath = html.includes("katex");
    const { encrypt_pwd, ...rest } = p;
    const data = {
      ...rest,
      url: postUrl(slug),
      html: content,
      encrypted,
      neighbours,
      relates,
      hasMath,
    };
    await writeJson(path.join(outDir, "posts", `${safePathSegment(slug)}.json`), data);
  }
};

const buildPageOutputs = async ({
  pages,
  outDir,
}: {
  pages: any[];
  outDir: string;
}) => {
  const visPages = visiblePages(pages);
  for (const p of visPages) {
    const slug = String(p.slug);
    const pagePath = `/${slug}/`;
    await writeJson(path.join(outDir, "pages", `${safePathSegment(slug)}.json`), {
      ...p,
      url: pagePath,
    });
  }
};

export const emitPublicData = async ({
  publicDir,
  posts,
  pages,
  friends = [],
  clear = true,
}: EmitPublicDataOptions) => {
  const outDir = path.join(publicDir, "_data");
  if (clear) {
    console.time("velite:emit:public-data:clear");
    await clearOutDir(outDir);
    console.timeEnd("velite:emit:public-data:clear");
  } else {
    console.log("[velite] skip public-data clear (clean disabled)");
  }

  console.time("velite:emit:public-data:collect");
  const visPosts = visiblePosts(posts);
  const canon = byDateDesc(canonicalPosts(posts));
  const canonSlugSet = new Set(canon.map((p) => String(p.slug)));
  const slugToPost = new Map(visPosts.map((p) => [String(p.slug), p]));
  console.timeEnd("velite:emit:public-data:collect");

  console.time("velite:emit:public-data:latest");
  const latest = canon.slice(0, 5).map((p, idx) => postMeta(p, { includeSummary: idx === 0 }));
  await writeJson(path.join(outDir, "posts", "latest.json"), latest);
  console.timeEnd("velite:emit:public-data:latest");

  console.time("velite:emit:public-data:category");
  await buildCategoryOutputs({ canon, outDir });
  console.timeEnd("velite:emit:public-data:category");
  console.time("velite:emit:public-data:posts");
  await buildPostOutputs({
    visPosts,
    canon,
    canonSlugSet,
    slugToPost,
    outDir,
  });
  console.timeEnd("velite:emit:public-data:posts");
  console.time("velite:emit:public-data:pages");
  await buildPageOutputs({ pages, outDir });
  console.timeEnd("velite:emit:public-data:pages");

  console.time("velite:emit:public-data:friends");
  await writeJson(path.join(outDir, "friends.json"), friends);
  console.timeEnd("velite:emit:public-data:friends");
};
