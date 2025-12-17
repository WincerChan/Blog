import { defineCollection, defineConfig, defineLoader, s } from "velite";
import rehypeSlug from "rehype-slug";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import YAML from "yaml";
import { load } from "cheerio";
import hljs from "highlight.js";
import katex from "katex";
import he from "he";

const MATTER_RE =
  /^---(?:\r?\n|\r)(?:([\s\S]*?)(?:\r?\n|\r))?---(?:\r?\n|\r|$)/;

const dedupeFrontmatterScalars = (frontmatter: string) => {
  const lines = frontmatter.split(/\r?\n/);
  const lastIndex = new Map<string, number>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = /^([A-Za-z0-9_-]+):\s*(.+)\s*$/.exec(line);
    if (!match) continue;
    lastIndex.set(match[1], i);
  }
  return lines
    .filter((line, i) => {
      const match = /^([A-Za-z0-9_-]+):\s*(.+)\s*$/.exec(line);
      if (!match) return true;
      return lastIndex.get(match[1]) === i;
    })
    .join("\n");
};

const matterLoader = defineLoader({
  test: /\.(md|mdx)$/,
  load: async (file) => {
    const value = file.toString().trim();
    const match = value.match(MATTER_RE);
    const matter = match == null ? null : match[1];
    const cleaned = matter == null ? null : dedupeFrontmatterScalars(matter);
    const data = cleaned == null ? {} : YAML.parse(cleaned) ?? {};
    const content = match == null ? value : value.slice(match[0].length).trim();
    return { data, content };
  },
});

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatUtc = (date: Date) => {
  const yyyy = date.getUTCFullYear();
  const mm = pad2(date.getUTCMonth() + 1);
  const dd = pad2(date.getUTCDate());
  const hh = pad2(date.getUTCHours());
  const mi = pad2(date.getUTCMinutes());
  const ss = pad2(date.getUTCSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}Z`;
};

const parseDateLikeHugo = (input: string | undefined) => {
  if (!input) return new Date(0);
  const v = input.trim();
  let normalized = v.replace(/\s+([+-]\d{2}:?\d{2}|[zZ])$/, "$1");
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) normalized = `${normalized}T00:00:00`;
  if (normalized.includes(" ") && !normalized.includes("T")) normalized = normalized.replace(" ", "T");
  normalized = normalized.replace(/T(\d):/, "T0$1:");
  normalized = normalized.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  if (!/[zZ]$|[+-]\d{2}:\d{2}$/.test(normalized)) normalized = `${normalized}+08:00`;
  return new Date(normalized);
};

const tocToHtml = (entries: Array<{ title: string; url: string; items: any[] }>) => {
  if (!entries || entries.length === 0) return '<nav id="TableOfContents"></nav>';
  const render = (items: typeof entries) => {
    const lis = items
      .map((it) => {
        const href = it.url.startsWith("#") ? it.url : `#${it.url}`;
        const nested = it.items?.length ? `<ul>${render(it.items)}</ul>` : "";
        return `<li><a href="${href}">${it.title}</a>${nested}</li>`;
      })
      .join("");
    return lis;
  };
  return `<nav id="TableOfContents"><ul>${render(entries)}</ul></nav>`;
};

const plainifyHtml = (html: string) => {
  const $ = load(html);
  const text = $.text();
  return text.replace(/\s+/g, " ").trim();
};

const countWords = (input: string) => {
  const text = input.normalize("NFKC");
  const han = (text.match(/\p{Script=Han}/gu) || []).length;
  const latinWords = (text.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) || []).length;

  return han + latinWords;
};

const renderMathToKatexHtml = (html: string) => {
  const mathPattern = /\$\$([\s\S]+?)\$\$/g;
  return he.decode(html).replace(mathPattern, (match, formula) => {
    try {
      const renderResult = katex.renderToString(he.decode(formula), {
        output: "html",
        displayMode: formula.trim().startsWith("\\begin"),
        strict: "warn",
      });
      const $ = load(renderResult);
      $("annotation").remove();
      return $("body").html() || renderResult;
    } catch {
      return match;
    }
  });
};

const highlightHtmlCodeBlocks = (html: string) => {
  const $ = load(html, { decodeEntities: false });
  $("pre > code").each((_, elem) => {
    const codeElem = $(elem);
    const classAttr = String(codeElem.attr("class") || "");
    const match = classAttr.match(/language-([a-zA-Z0-9_+-]+)/);
    const lang = match?.[1]?.toLowerCase();
    const text = he.decode(codeElem.text());

    const highlighted = lang && hljs.getLanguage(lang)
      ? hljs.highlight(text, { language: lang, ignoreIllegals: true }).value
      : hljs.highlightAuto(text).value;

    codeElem.html(highlighted);
    if (lang) codeElem.attr("data-lang", lang);
    else codeElem.removeAttr("data-lang");
    const nextClass = new Set(
      classAttr
        .split(/\s+/)
        .filter(Boolean)
        .concat(["hljs"])
        .concat(lang ? [`language-${lang}`] : []),
    );
    codeElem.attr("class", Array.from(nextClass).join(" "));
  });
  return $.html();
};

const normalizeHtmlForSite = (html: string) => {
  const $ = load(html, { decodeEntities: false });
  $("img").each((_, elem) => {
    const e = $(elem);
    if (!e.attr("loading")) e.attr("loading", "lazy");
    if (!e.attr("decoding")) e.attr("decoding", "async");
    if (!e.attr("referrerpolicy")) e.attr("referrerpolicy", "no-referrer");
  });
  $("table").wrap('<div class="table-wrapper"></div>');
  return $.html();
};

const readSiteConf = async (repoRoot: string) => {
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

const uuidFromSha1 = (hex: string) =>
  `urn:uuid:${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 17)}9${hex.slice(17, 19)}-${hex.slice(21, 33)}`;

const sha1Hex = (input: string) =>
  crypto.createHash("sha1").update(input).digest("hex");

const hugoAtomIdFromString = (input: string) => uuidFromSha1(sha1Hex(input));

const writeFile = async (filepath: string, content: string) => {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, content, "utf8");
};

const Post = defineCollection({
  name: "Post",
  pattern: "posts/**/*.md",
  schema: s.object({
    title: s.string(),
    subtitle: s.string().optional(),
    date: s.string(),
    updated: s.string().optional(),
    category: s.string().optional(),
    tags: s.array(s.any()).optional(),
    slug: s.string(),
    draft: s.boolean().optional(),
    private: s.boolean().optional(),
    cover: s.string().optional(),
    encrypt_pwd: s.string().optional(),
    mathrender: s.boolean().optional(),
    isTranslation: s.boolean().optional(),
    lang: s.string().optional(),
    contentHtml: s.markdown({
      copyLinkedFiles: false,
      removeComments: false,
      rehypePlugins: [rehypeSlug],
    }),
    tocEntries: s.toc({ maxDepth: 5 }),
  }),
});

const Page = defineCollection({
  name: "Page",
  pattern: "page/**/*.md",
  schema: s.object({
    title: s.string(),
    date: s.string(),
    updated: s.string().optional(),
    slug: s.string(),
    weight: s.number().optional(),
    draft: s.boolean().optional(),
    private: s.boolean().optional(),
    cover: s.string().optional(),
    isTranslation: s.boolean().optional(),
    lang: s.string().optional(),
    contentHtml: s.markdown({
      copyLinkedFiles: false,
      removeComments: false,
      rehypePlugins: [rehypeSlug],
    }),
    tocEntries: s.toc({ maxDepth: 5 }),
  }),
});

const Friend = defineCollection({
  name: "Friend",
  pattern: "friends.json",
  schema: s.object({
    name: s.string(),
    url: s.string(),
    avatar: s.string().optional(),
    inactive: s.boolean().optional(),
  }),
});

export default defineConfig({
  root: "_blogs/content",
  loaders: [matterLoader],
  collections: {
    posts: Post,
    pages: Page,
    friends: Friend,
  },
  output: {
    data: ".velite",
    clean: true,
  },
  prepare: async (data, context) => {
    const repoRoot = path.dirname(context.config.configPath);
    const site = await readSiteConf(repoRoot);
    const publicDir = path.join(repoRoot, "public");

    const markerRe = /<!--\s*more\s*-->/i;
    const markerReGlobal = /<!--\s*more\s*-->/gi;

    const posts = (data.posts as any[]).map((p) => {
      const dateObj = parseDateLikeHugo(p.date);
      const updatedObj = parseDateLikeHugo(p.updated ?? p.date);

      const originalHtml = String(p.contentHtml ?? "");
      const markerIdx = originalHtml.search(markerRe);
      const summaryHtml =
        markerIdx >= 0 ? originalHtml.slice(0, markerIdx) : originalHtml;
      const withoutMarker =
        markerIdx >= 0 ? originalHtml.replace(markerReGlobal, "") : originalHtml;

      let html = normalizeHtmlForSite(withoutMarker);
      html = highlightHtmlCodeBlocks(html);
      if (p.mathrender) html = renderMathToKatexHtml(html);

      const summary = plainifyHtml(summaryHtml).slice(0, 260);
      const words = countWords(plainifyHtml(html));
      const toc = tocToHtml(Array.isArray(p.tocEntries) ? p.tocEntries : []);

      return {
        ...p,
        tags: Array.isArray(p.tags) ? p.tags.map((x) => String(x)).filter(Boolean) : [],
        dateObj,
        updatedObj,
        url: `/posts/${String(p.slug)}/`,
        html,
        toc,
        summary,
        words,
      };
    });

    const pages = (data.pages as any[]).map((p) => {
      const dateObj = parseDateLikeHugo(p.date);
      const updatedObj = parseDateLikeHugo(p.updated ?? p.date);
      const originalHtml = String(p.contentHtml ?? "");
      const markerIdx = originalHtml.search(markerRe);
      const summaryHtml =
        markerIdx >= 0 ? originalHtml.slice(0, markerIdx) : originalHtml;
      const withoutMarker =
        markerIdx >= 0 ? originalHtml.replace(markerReGlobal, "") : originalHtml;

      let html = normalizeHtmlForSite(withoutMarker);
      html = highlightHtmlCodeBlocks(html);

      const summary = plainifyHtml(summaryHtml).slice(0, 260);
      const toc = tocToHtml(Array.isArray(p.tocEntries) ? p.tocEntries : []);

      return {
        ...p,
        dateObj,
        updatedObj,
        url: `/${String(p.slug)}/`,
        html,
        toc,
        summary,
      };
    });

    data.posts = posts;
    data.pages = pages;

    const renderablePosts = [...posts]
      .filter((p) => p.draft !== true)
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    const publishedPosts = renderablePosts.filter(
      (p) => p.private !== true && p.isTranslation !== true,
    );
    const renderablePages = [...pages].filter((p) => p.draft !== true);
    const publishedPages = renderablePages.filter(
      (p) => p.private !== true && p.isTranslation !== true,
    );

    const latestUpdated = (items: any[]) =>
      items.reduce((acc, x) => Math.max(acc, x.updatedObj?.getTime?.() ?? 0), 0);

    const sitemapHeader =
      '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

    const sitemapIndex =
      `${sitemapHeader}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      [
        { section: "posts", lastmod: latestUpdated(renderablePosts) },
        { section: "base", lastmod: latestUpdated(renderablePages) },
        { section: "category", lastmod: Date.now() },
      ]
        .map(
          (s) =>
            `  <sitemap>\n    <loc>${site.baseURL}/${s.section}/sitemap.xml</loc>\n    <lastmod>${formatUtc(new Date(s.lastmod || Date.now()))}</lastmod>\n  </sitemap>`,
        )
        .join("\n") +
      `\n</sitemapindex>\n`;

    await writeFile(path.join(publicDir, "sitemap.xml"), sitemapIndex);

    const urlsetStart = (extraNs: string) =>
      `${sitemapHeader}\n<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ${extraNs}xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const urlsetEnd = `</urlset>\n`;

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
          return (
            `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>` +
            alt +
            `\n    <changefreq>${site.sitemap.changeFreq}</changefreq>\n    <priority>${site.sitemap.priority}</priority>\n  </url>`
          );
        })
        .join("\n") +
      `\n${urlsetEnd}`;

    await writeFile(path.join(publicDir, "posts", "sitemap.xml"), postSitemap);

    const baseSitemap =
      urlsetStart("") +
      `  <url>\n    <loc>${site.baseURL}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1</priority>\n  </url>\n` +
      renderablePages
        .map((p) => {
          const loc = `${site.baseURL}/${String(p.slug)}/`;
          const lastmod = formatUtc(p.updatedObj);
          return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${site.sitemap.changeFreq}</changefreq>\n    <priority>${site.sitemap.priority}</priority>\n  </url>`;
        })
        .join("\n") +
      `\n${urlsetEnd}`;
    await writeFile(path.join(publicDir, "base", "sitemap.xml"), baseSitemap);

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

    const escapeXmlText = (value: string) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");

    const stripHtmlDocument = (html: string) => {
      const $ = load(String(html ?? ""), { decodeEntities: false });
      return $("body").html() || $.root().html() || "";
    };

    const stripToPlainText = (html: string) => {
      const $ = load(String(html ?? ""), { decodeEntities: true });
      const text = $("body").text() || $.root().text() || "";
      return text.replace(/\s+/g, " ").trim();
    };

    const siteBaseForAtom = new URL("/", site.baseURL).toString();
    const feedId = hugoAtomIdFromString(siteBaseForAtom);
    const feedUpdated = formatUtc(
      new Date(Math.max(latestUpdated(renderablePosts), Date.now())),
    );
    const atomEntries = publishedPosts
      .map((p) => {
        const url = new URL(`/posts/${String(p.slug)}/`, site.baseURL).toString();
        const permalinkForId = new URL(
          `/posts/${String(p.slug)}/index.jsx`, // for compatiable
          siteBaseForAtom,
        ).toString();
        const id = hugoAtomIdFromString(permalinkForId);
        const title = escapeXmlText(p.title);
        const published = p.dateObj.toISOString();
        const updated = p.updatedObj.toISOString();

        const isEncrypted = !!p.encrypt_pwd;
        const summaryText =
          isEncrypted
            ? "抱歉，本文已加密，请至网站输入密码后阅读。"
            : String(p.summary || "").trim() ||
            stripToPlainText(stripHtmlDocument(String(p.html ?? ""))).slice(0, 220);

        const cover = String(p.cover ?? "").trim();
        const coverHtml = cover
          ? `<p><img src="${escapeXmlText(cover)}" alt="cover" /></p>`
          : "";

        const bodyHtml = stripHtmlDocument(String(p.html ?? ""));
        const fullHtml = coverHtml + bodyHtml;

        const contentXml = isEncrypted ? escapeXmlText(summaryText) : escapeXmlText(fullHtml);

        return (
          `  <entry>\n` +
          `    <title>${title}</title>\n` +
          `    <link rel="alternate" type="text/html" href="${escapeXmlText(url)}" />\n` +
          `    <id>${id}</id>\n` +
          `    <published>${published}</published>\n` +
          `    <updated>${updated}</updated>\n` +
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

    const atomXsl = `<?xml version="1.0" encoding="UTF-8"?>\n` +
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

    const manifest = {
      name: site.title,
      short_name: "Wincer",
      description: site.description,
      lang: "zh-CN",
      start_url: "/",
      display: "fullscreen",
      orientation: "natural",
      theme_color: "#065279",
      background_color: "#065279",
      icons: [
        {
          src: "https://cdn.jsdelivr.net/npm/wir@1.0.2/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "https://cdn.jsdelivr.net/npm/wir@1.0.2/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    };
    await writeFile(
      path.join(publicDir, "manifest.webmanifest"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    await writeFile(
      path.join(publicDir, "sass", "atom.css"),
      `body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;max-width:860px;margin:2rem auto;line-height:1.6;padding:0 1rem;color:#111}a{color:#065279;text-decoration:none}img{max-width:100%}pre{white-space:pre-wrap}\n`,
    );
  },
});
