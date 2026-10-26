import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import {
  byDateDesc,
  canonicalPosts,
  computeNeighbours,
  computeRelated,
  postMeta,
  postUrl,
  visiblePages,
  visiblePosts,
} from "../shared";
import { buildInkstoneToken } from "../inkstoneToken";
import { normalizeCommentPath } from "../commentsMapping";

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
  posts: any[];
  pages: any[];
  friends?: any[];
  tokenSecret: string;
  discussionMapping?: Map<string, string>;
};

const buildCategoryOutputs = async ({
  canon,
  outputs,
  tokenSecret,
}: {
  canon: any[];
  outputs: Map<string, any>;
  tokenSecret: string;
}) => {
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
    const categoryPath = `/category/${encodeURIComponent(title)}/`;
    const data = {
      inkstoneToken: buildInkstoneToken(categoryPath, tokenSecret),
      items: byDateDesc(list).map((p) => postMeta(p, { includeSummary: true })),
    };
    outputs.set(`category/${title}`, data);
    categoryIndex.push({ title, count: list.length, url: categoryPath });
  }
  outputs.set("categories", categoryIndex);
};

const buildPostOutputs = async ({
  visPosts,
  canon,
  canonSlugSet,
  slugToPost,
  outputs,
  tokenSecret,
  discussionMapping,
}: {
  visPosts: any[];
  canon: any[];
  canonSlugSet: Set<string>;
  slugToPost: Map<string, any>;
  outputs: Map<string, any>;
  tokenSecret: string;
  discussionMapping?: Map<string, string>;
}) => {
  for (const p of visPosts) {
    const slug = String(p.slug);
    const postPath = postUrl(slug);
    const neighbours = computeNeighbours(p, { canon, canonSlugSet, slugToPost });
    const relates = computeRelated(p, canon);
    const html = String(p.html ?? "");
    const encryptPwd = String(p.encrypt_pwd ?? "");
    const encrypted = !!encryptPwd;
    const content = encrypted ? encryptHtml(encryptPwd, html) : html;
    const hasMath = html.includes("katex");
    const { encrypt_pwd, rawContent, searchText, ...rest } = p;
    const discussionUrl =
      discussionMapping?.get(normalizeCommentPath(postPath)) ?? undefined;
    const data = {
      ...rest,
      url: postPath,
      inkstoneToken: buildInkstoneToken(postPath, tokenSecret),
      html: content,
      encrypted,
      neighbours,
      relates,
      hasMath,
      ...(discussionUrl ? { discussionUrl } : {}),
    };
    outputs.set(`posts/${slug}`, data);
  }
};

const buildPageOutputs = async ({
  pages,
  outputs,
  tokenSecret,
}: {
  pages: any[];
  outputs: Map<string, any>;
  tokenSecret: string;
}) => {
  const visPages = visiblePages(pages);
  for (const p of visPages) {
    const slug = String(p.slug);
    const pagePath = `/${slug}/`;
    outputs.set(`pages/${slug}`, {
      ...p,
      url: pagePath,
      inkstoneToken: buildInkstoneToken(pagePath, tokenSecret),
    });
  }
};

export const buildPublicData = async ({
  posts,
  pages,
  friends = [],
  tokenSecret,
  discussionMapping,
}: EmitPublicDataOptions) => {
  const outputs = new Map<string, any>();
  console.time("content:emit:public-data:collect");
  const visPosts = visiblePosts(posts);
  const canon = byDateDesc(canonicalPosts(posts));
  const canonSlugSet = new Set(canon.map((p) => String(p.slug)));
  const slugToPost = new Map(visPosts.map((p) => [String(p.slug), p]));
  console.timeEnd("content:emit:public-data:collect");

  console.time("content:emit:public-data:latest");
  const latest = {
    inkstoneToken: buildInkstoneToken("/", tokenSecret),
    items: canon.slice(0, 5).map((p, idx) => postMeta(p, { includeSummary: idx === 0 })),
  };
  outputs.set("latest", latest);
  console.timeEnd("content:emit:public-data:latest");

  console.time("content:emit:public-data:category");
  await buildCategoryOutputs({ canon, outputs, tokenSecret });
  console.timeEnd("content:emit:public-data:category");
  console.time("content:emit:public-data:posts");
  await buildPostOutputs({
    visPosts,
    canon,
    canonSlugSet,
    slugToPost,
    outputs,
    tokenSecret,
    discussionMapping,
  });
  console.timeEnd("content:emit:public-data:posts");
  console.time("content:emit:public-data:pages");
  await buildPageOutputs({ pages, outputs, tokenSecret });
  console.timeEnd("content:emit:public-data:pages");

  console.time("content:emit:public-data:friends");
  outputs.set("friends", friends);
  console.timeEnd("content:emit:public-data:friends");
  return {
    posts: visPosts.map(p => outputs.get(`posts/${p.slug}`)),
    pages: visiblePages(pages).map(p => outputs.get(`pages/${p.slug}`)),
    latest,
    categories: outputs.get("categories") as Array<{title: string; count: number; url: string}>,
    categoryData: Object.fromEntries([...outputs].filter(([key]) => key.startsWith("category/")).map(([key, value]) => [key.slice(9), value])),
    friends,
  };
};
