import crypto from "node:crypto";
import path from "node:path";
import type { SiteConf } from "../site";
import { writeFile } from "../io";
import { formatUtc } from "../time";
import { escapeXmlText, latestUpdated } from "./xml";

const uuidFromSha1 = (hex: string) =>
  `urn:uuid:${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 17)}9${hex.slice(17, 19)}-${hex.slice(21, 33)}`;

const sha1Hex = (input: string) => crypto.createHash("sha1").update(input).digest("hex");

const hugoAtomIdFromString = (input: string) => uuidFromSha1(sha1Hex(input));

export const emitAtom = async ({
  site,
  publicDir,
  publishedPosts,
  renderablePosts,
}: {
  site: SiteConf;
  publicDir: string;
  publishedPosts: any[];
  renderablePosts: any[];
}) => {
  const siteBaseForAtom = new URL("/", site.baseURL).toString();
  const feedId = hugoAtomIdFromString(siteBaseForAtom);
  const feedUpdated = formatUtc(new Date(Math.max(latestUpdated(renderablePosts), Date.now())));

  const atomEntries = publishedPosts
    .map((p) => {
      const url = new URL(`/posts/${String(p.slug)}/`, site.baseURL).toString();
      const permalinkForId = new URL(
        `/posts/${String(p.slug)}/index.jsx`, // for compatible
        siteBaseForAtom,
      ).toString();
      const id = hugoAtomIdFromString(permalinkForId);
      const title = escapeXmlText(p.title);
      const published = p.dateObj.toISOString();
      const updated = p.updatedObj.toISOString();

      const isEncrypted = !!p.encrypt_pwd;
      const summaryText = isEncrypted
        ? "抱歉，本文已加密，请至网站输入密码后阅读。"
        : String(p.summary || "").trim() || String(p.title || "").trim();

      const cover = String(p.cover ?? "").trim();
      const coverHtml = cover ? `<p><img src="${escapeXmlText(cover)}" alt="cover" /></p>` : "";

      const bodyHtml = String(p.html ?? "");
      const fullHtml = coverHtml + bodyHtml;

      const contentXml = isEncrypted ? escapeXmlText(summaryText) : escapeXmlText(fullHtml);
      const categoryTerm = String(p.category ?? "").trim();
      const categoryScheme = new URL("/category", site.baseURL).toString();
      const tagScheme = new URL("/tag", site.baseURL).toString();
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const categoryXml = categoryTerm
        ? `    <category term="${escapeXmlText(categoryTerm)}" scheme="${escapeXmlText(
            categoryScheme,
          )}" label="${escapeXmlText(categoryTerm)}" />\n`
        : "";
      const tagsXml = tags
        .map(
          (tag) =>
            `    <category term="${escapeXmlText(String(tag))}" scheme="${escapeXmlText(
              tagScheme,
            )}" label="${escapeXmlText(String(tag))}" />\n`,
        )
        .join("");

      return (
        `  <entry>\n` +
        `    <title>${title}</title>\n` +
        `    <link rel="alternate" type="text/html" href="${escapeXmlText(url)}" />\n` +
        `    <id>${id}</id>\n` +
        `    <published>${published}</published>\n` +
        `    <updated>${updated}</updated>\n` +
        categoryXml +
        tagsXml +
        `    <summary>${escapeXmlText(summaryText)}</summary>\n` +
        (isEncrypted
          ? `    <content type="text">${contentXml}</content>\n`
          : `    <content type="html">${contentXml}</content>\n`) +
        `  </entry>`
      );
    })
    .join("\n");

  const atom =
    `<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\" ?>\n` +
    `<?xml-stylesheet type=\"text/xsl\" href=\"/atom.xsl\" ?>\n` +
    `<feed xmlns=\"http://www.w3.org/2005/Atom\" xml:base=\"${siteBaseForAtom}\">\n` +
    `  <title>${escapeXmlText(`${site.title} ATOM`)}</title>\n` +
    `  <link href=\"${new URL("/atom.xml", siteBaseForAtom).toString()}\" rel=\"self\" type=\"application/atom+xml\" />\n` +
    `  <author><name>${escapeXmlText(site.author)}</name></author>\n` +
    `  <updated>${feedUpdated}</updated>\n` +
    `  <id>${feedId}</id>\n` +
    atomEntries +
    `\n</feed>\n`;

  await writeFile(path.join(publicDir, "atom.xml"), atom);

  const atomXsl =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<xsl:stylesheet version="1.0"\n` +
    `  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"\n` +
    `  xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <xsl:output method="html" encoding="UTF-8" indent="yes" />\n` +
    `  <xsl:template match="/atom:feed">\n` +
    `    <html>\n` +
    `      <head>\n` +
    `        <meta charset="utf-8" />\n` +
    `        <meta name="viewport" content="width=device-width, initial-scale=1" />\n` +
    `        <title><xsl:value-of select="atom:title" /></title>\n` +
    `        <link rel="stylesheet" href="/sass/atom.css" />\n` +
    `      </head>\n` +
    `      <body>\n` +
    `        <h1><xsl:value-of select="atom:title" /></h1>\n` +
    `        <p>This is an Atom feed. Subscribe with an RSS/Atom reader.</p>\n` +
    `        <p>\n` +
    `          <a>\n` +
    `            <xsl:attribute name="href">\n` +
    `              <xsl:value-of select="atom:link[@rel='self']/@href" />\n` +
    `            </xsl:attribute>\n` +
    `            View raw XML\n` +
    `          </a>\n` +
    `        </p>\n` +
    `        <hr />\n` +
    `        <xsl:for-each select="atom:entry">\n` +
    `          <article>\n` +
    `            <h2>\n` +
    `              <a>\n` +
    `                <xsl:attribute name="href">\n` +
    `                  <xsl:value-of select="atom:link[@rel='alternate']/@href" />\n` +
    `                </xsl:attribute>\n` +
    `                <xsl:value-of select="atom:title" />\n` +
    `              </a>\n` +
    `            </h2>\n` +
    `            <p>\n` +
    `              <strong>Published:</strong> <xsl:value-of select="atom:published" />\n` +
    `              <xsl:text> · </xsl:text>\n` +
    `              <strong>Updated:</strong> <xsl:value-of select="atom:updated" />\n` +
    `            </p>\n` +
    `            <div>\n` +
    `              <xsl:value-of select="atom:summary" />\n` +
    `            </div>\n` +
    `            <hr />\n` +
    `          </article>\n` +
    `        </xsl:for-each>\n` +
    `      </body>\n` +
    `    </html>\n` +
    `  </xsl:template>\n` +
    `</xsl:stylesheet>\n`;

  await writeFile(path.join(publicDir, "atom.xsl"), atomXsl);
};
