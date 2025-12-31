import fs from "node:fs/promises";
import path from "node:path";
import { postUrl } from "../shared";

const toIsoString = (value: unknown) => {
  if (value instanceof Date) return value.toISOString();
  const date = new Date(String(value ?? ""));
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
};

const normalizeTags = (value: unknown) =>
  Array.isArray(value) ? value.map((tag) => String(tag)).filter(Boolean) : [];

export const emitSearchIndex = async ({
  publicDir,
  posts,
}: {
  publicDir: string;
  posts: any[];
}) => {
  const payload = posts.map((post) => {
    const slug = String(post.slug ?? "");
    const isEncrypted = !!post.encrypt_pwd;
    const rawContent = String(post.rawContent ?? "");
    const encryptedNotice = "抱歉，本文已加密，请至网站输入密码后阅读。";
    return {
      title: String(post.title ?? ""),
      subtitle: String(post.subtitle ?? ""),
      url: postUrl(slug),
      date: toIsoString(post.dateObj ?? post.date),
      updated: toIsoString(post.updatedObj ?? post.updated ?? post.date),
      category: String(post.category ?? ""),
      tags: normalizeTags(post.tags),
      content: isEncrypted ? encryptedNotice : rawContent,
    };
  });

  const outputPath = path.join(publicDir, "search-index.json");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(payload), "utf8");
};
