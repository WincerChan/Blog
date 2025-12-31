import path from "node:path";
import { formatUtc } from "../time";
import type { SiteConf } from "../site";
import { writeFile } from "../io";
import { escapeXmlText, latestUpdated } from "./xml";

const toAbsoluteUrl = (baseURL: string, value: string) => {
  const src = String(value ?? "").trim();
  if (!src || src.startsWith("data:")) return null;
  try {
    return new URL(src, baseURL).toString();
  } catch {
    return null;
  }
};

const extractImagesFromHtml = (html: string, max = 5) => {
  const out: Array<{ src: string; alt?: string }> = [];
  const raw = String(html ?? "");
  const imgRe = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(raw)) && out.length < max) {
    const tag = m[0]!;
    const srcMatch =
      /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i.exec(tag);
    const src = srcMatch?.[1] ?? srcMatch?.[2] ?? srcMatch?.[3];
    if (!src) continue;
    const altMatch = /\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
    const alt = altMatch?.[1] ?? altMatch?.[2] ?? undefined;
    out.push({ src, alt });
  }
  return out;
};

const imagesForSitemap = (site: SiteConf, entry: any) => {
  const images: Array<{ loc: string; caption?: string }> = [];
  const seen = new Set<string>();

  const add = (src: string, caption?: string) => {
    const abs = toAbsoluteUrl(site.baseURL, src);
    if (!abs) return;
    if (seen.has(abs)) return;
    seen.add(abs);
    images.push({ loc: abs, caption: caption?.trim() || undefined });
  };

  const cover = String(entry.cover ?? "").trim();
  if (cover) add(cover, "cover");

  for (const img of extractImagesFromHtml(String(entry.html ?? ""), 5)) {
    add(img.src, img.alt);
  }

  return images;
};

const sitemapHeader =
  '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

const urlsetStart = (extraNs: string) =>
  `${sitemapHeader}\n<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ${extraNs}xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
const urlsetEnd = `</urlset>\n`;

const imagesXmlForEntry = (site: SiteConf, entry: any) =>
  imagesForSitemap(site, entry)
    .map((img) => {
      const loc = escapeXmlText(img.loc);
      const caption = img.caption
        ? `\n      <image:caption>${escapeXmlText(img.caption)}</image:caption>`
        : "";
      return `\n    <image:image>\n      <image:loc>${loc}</image:loc>${caption}\n    </image:image>`;
    })
    .join("");

export const emitSitemaps = async ({
  site,
  publicDir,
  renderablePosts,
  renderablePages,
  publishedPosts,
}: {
  site: SiteConf;
  publicDir: string;
  renderablePosts: any[];
  renderablePages: any[];
  publishedPosts: any[];
}) => {
  const sitemapIndex =
    `${sitemapHeader}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    [
      { section: "posts", lastmod: latestUpdated(renderablePosts) },
      { section: "pages", lastmod: latestUpdated(renderablePages) },
      { section: "category", lastmod: Date.now() },
    ]
      .map(
        (s) =>
          `  <sitemap>\n    <loc>${site.baseURL}/${s.section}/sitemap.xml</loc>\n    <lastmod>${formatUtc(new Date(s.lastmod || Date.now()))}</lastmod>\n  </sitemap>`,
      )
      .join("\n") +
    `\n</sitemapindex>\n`;

  await writeFile(path.join(publicDir, "sitemap.xml"), sitemapIndex);

  const postSitemap =
    urlsetStart('xmlns:xhtml="http://www.w3.org/1999/xhtml" ') +
    `  <url>\n    <loc>${site.baseURL}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1</priority>\n  </url>\n` +
    renderablePosts
      .map((p) => {
        const loc = `${site.baseURL}/posts/${String(p.slug)}/`;
        const lastmod = formatUtc(p.updatedObj);
        let alt = "";
        if (p.lang) {
          const lang = String(p.lang);
          const shortLang = lang === "en" ? "en" : "zh";
          const reverseLang = shortLang === "en" ? "zh" : "en";
          const reverseHrefLang = shortLang === "zh" ? "en" : "zh-CN";
          const selfHref = loc;
          const reverseHref =
            p.isTranslation === true
              ? `${site.baseURL}/posts/${String(p.slug).replace(new RegExp(`-${shortLang}$`), "")}/`
              : `${site.baseURL}/posts/${String(p.slug)}-${reverseLang}/`;
          alt =
            `\n    <xhtml:link rel="alternate" hreflang="${lang}" href="${selfHref}" />\n` +
            `    <xhtml:link rel="alternate" hreflang="${reverseHrefLang}" href="${reverseHref}" />`;
        }

        const imagesXml = imagesXmlForEntry(site, p);

        return (
          `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>` +
          alt +
          imagesXml +
          `\n    <changefreq>${site.sitemap.changeFreq}</changefreq>\n    <priority>${site.sitemap.priority}</priority>\n  </url>`
        );
      })
      .join("\n") +
    `\n${urlsetEnd}`;

  await writeFile(path.join(publicDir, "posts", "sitemap.xml"), postSitemap);

  const pagesSitemap =
    urlsetStart("") +
    `  <url>\n    <loc>${site.baseURL}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1</priority>\n  </url>\n` +
    renderablePages
      .map((p) => {
        const loc = `${site.baseURL}/${String(p.slug)}/`;
        const lastmod = formatUtc(p.updatedObj);
        const imagesXml = imagesXmlForEntry(site, p);
        return (
          `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>` +
          imagesXml +
          `\n    <changefreq>${site.sitemap.changeFreq}</changefreq>\n    <priority>${site.sitemap.priority}</priority>\n  </url>`
        );
      })
      .join("\n") +
    `\n${urlsetEnd}`;
  await writeFile(path.join(publicDir, "pages", "sitemap.xml"), pagesSitemap);

  const categoryToPosts = new Map<string, any[]>();
  for (const p of publishedPosts) {
    if (!p.category) continue;
    const key = String(p.category);
    const list = categoryToPosts.get(key) ?? [];
    list.push(p);
    categoryToPosts.set(key, list);
  }

  const categorySitemap =
    urlsetStart("") +
    Array.from(categoryToPosts.keys())
      .map((c) => {
        const loc = `${site.baseURL}/category/${c}/`;
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${formatUtc(new Date())}</lastmod>\n    <changefreq>${site.sitemap.changeFreq}</changefreq>\n    <priority>${site.sitemap.termPriority}</priority>\n  </url>`;
      })
      .join("\n") +
    `\n${urlsetEnd}`;
  await writeFile(path.join(publicDir, "category", "sitemap.xml"), categorySitemap);
};
