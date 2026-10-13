import fs from "node:fs/promises";
import path from "node:path";
import { postUrl } from "../shared";
import { transforms } from "../markdown";

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
    const plainTitle = transforms.plainFromMarkdown(String(post.title ?? ""));
    const plainSubtitle = transforms.plainFromMarkdown(String(post.subtitle ?? ""));
    const plainContent = transforms.plainFromMarkdown(rawContent);
    const encryptedNotice = "抱歉，本文已加密，请至网站输入密码后阅读。";
    const contentText = isEncrypted ? encryptedNotice : plainContent;
    const titleSplit = transforms.splitCjkLatinText(plainTitle);
    const subtitleSplit = transforms.splitCjkLatinText(plainSubtitle);
    const contentSplit = transforms.splitCjkLatinText(contentText);
    return {
      title: plainTitle,
      subtitle: plainSubtitle,
      url: postUrl(slug),
      date: toIsoString(post.dateObj ?? post.date),
      updated: toIsoString(post.updatedObj ?? post.updated ?? post.date),
      category: String(post.category ?? ""),
      tags: normalizeTags(post.tags),
      content: contentText,
      title_cjk: titleSplit.cjk,
      title_latin: titleSplit.latin,
      subtitle_cjk: subtitleSplit.cjk,
      subtitle_latin: subtitleSplit.latin,
      content_cjk: contentSplit.cjk,
      content_latin: contentSplit.latin,
    };
  });

  const outputPath = path.join(publicDir, "search-index.json");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(payload), "utf8");
};
