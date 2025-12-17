import { defineCollection, defineConfig, defineLoader, s } from "velite";
import rehypeSlug from "rehype-slug";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import YAML from "yaml";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

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

const normalizeWhitespace = (value: string) =>
  String(value ?? "").replace(/\s+/g, " ").trim();

const countWords = (input: string) => {
  const text = input.normalize("NFKC");
  const han = (text.match(/\p{Script=Han}/gu) || []).length;
  const latinWords = (text.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) || []).length;

  return han + latinWords;
};

const getClassList = (node: any) => {
  const cn = node?.properties?.className;
  if (Array.isArray(cn)) return cn.map(String).filter(Boolean);
  if (typeof cn === "string") return cn.split(/\s+/).filter(Boolean);
  return [];
};

const MORE_MARKER_RE = /<!--\s*more\s*-->/i;

const rehypeBlogEnhancements = () => {
  return (tree: any, file: any) => {
    const isMoreMarkerNode = (node: any) => {
      if (!node) return false;
      if (node.type === "comment") return String(node.value ?? "").trim().toLowerCase() === "more";
      if (node.type === "raw") return MORE_MARKER_RE.test(String(node.value ?? ""));
      return false;
    };

    const isTableWrapper = (node: any) =>
      node?.type === "element" &&
      String(node.tagName || "").toLowerCase() === "div" &&
      getClassList(node).includes("table-wrapper");

    const walk = (node: any, ancestorTags: string[]) => {
      if (!node) return;
      const isElement = node.type === "element";
      const tag = isElement ? String(node.tagName || "").toLowerCase() : "";
      const nextAncestors = isElement ? ancestorTags.concat(tag) : ancestorTags;

      if (isElement && tag === "img") {
        node.properties ??= {};
        if (!node.properties.loading) node.properties.loading = "lazy";
        if (!node.properties.decoding) node.properties.decoding = "async";
        if (!node.properties.referrerpolicy) node.properties.referrerpolicy = "no-referrer";
      }

      if (!Array.isArray(node.children)) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];

        if (isMoreMarkerNode(child)) {
          node.children.splice(i, 1);
          i -= 1;
          continue;
        }

        if (
          child?.type === "element" &&
          String(child.tagName || "").toLowerCase() === "table" &&
          !isTableWrapper(node)
        ) {
          const wrapper = {
            type: "element",
            tagName: "div",
            properties: { className: ["table-wrapper"] },
            children: [child],
          };
          node.children.splice(i, 1, wrapper);
          walk(wrapper, nextAncestors);
          continue;
        }

        walk(child, nextAncestors);
      }
    };

    walk(tree, []);
  };
};

const getMetaFromZodCtx = (ctx: unknown) => (ctx as any)?.meta as any;

const summaryFromMeta = (meta: any, maxLen: number) => {
  const mdast = meta?.mdast;
  if (mdast) {
    const state = { parts: [] as string[], done: false };
    const collect = (node: any) => {
      if (!node || state.done) return;
      if (node.type === "html" && MORE_MARKER_RE.test(String(node.value ?? ""))) {
        state.done = true;
        return;
      }
      if (node.type === "text") state.parts.push(String(node.value ?? ""));
      if (node.type === "inlineCode") state.parts.push(String(node.value ?? ""));
      if (node.type === "code") state.parts.push(String(node.value ?? ""));
      const children = node.children;
      if (Array.isArray(children)) for (const c of children) collect(c);
    };
    collect(mdast);
    if (state.done) return normalizeWhitespace(state.parts.join(" ")).slice(0, maxLen);
  }
  return normalizeWhitespace(String(meta?.plain ?? "")).slice(0, maxLen);
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
    html: s.markdown({
      copyLinkedFiles: false,
      removeComments: false,
      remarkPlugins: [[remarkMath, { singleDollarTextMath: false }]],
      rehypePlugins: [
        rehypeSlug,
        rehypeBlogEnhancements,
        [rehypeHighlight, { ignoreMissing: true }],
        [rehypeKatex, { strict: "warn" }],
      ],
    }),
    toc: s.toc({ maxDepth: 5 }).transform((entries) =>
      tocToHtml(Array.isArray(entries) ? (entries as any) : []),
    ),
    summary: s.raw().transform((_, ctx) => summaryFromMeta(getMetaFromZodCtx(ctx), 260)),
    words: s.raw().transform((_, ctx) => {
      const meta = getMetaFromZodCtx(ctx);
      return countWords(normalizeWhitespace(String(meta?.plain ?? "")));
    }),
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
    html: s.markdown({
      copyLinkedFiles: false,
      removeComments: false,
      remarkPlugins: [[remarkMath, { singleDollarTextMath: false }]],
      rehypePlugins: [
        rehypeSlug,
        rehypeBlogEnhancements,
        [rehypeHighlight, { ignoreMissing: true }],
        [rehypeKatex, { strict: "warn" }],
      ],
    }),
    toc: s.toc({ maxDepth: 5 }).transform((entries) =>
      tocToHtml(Array.isArray(entries) ? (entries as any) : []),
    ),
    summary: s.raw().transform((_, ctx) => summaryFromMeta(getMetaFromZodCtx(ctx), 260)),
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

    const posts = (data.posts as any[]).map((p) => {
      const dateObj = parseDateLikeHugo(p.date);
      const updatedObj = parseDateLikeHugo(p.updated ?? p.date);

      return {
        ...p,
        tags: Array.isArray(p.tags) ? p.tags.map((x) => String(x)).filter(Boolean) : [],
        dateObj,
        updatedObj,
        url: `/posts/${String(p.slug)}/`,
      };
    });

    const pages = (data.pages as any[]).map((p) => {
      const dateObj = parseDateLikeHugo(p.date);
      const updatedObj = parseDateLikeHugo(p.updated ?? p.date);

      return {
        ...p,
        dateObj,
        updatedObj,
        url: `/${String(p.slug)}/`,
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
            : String(p.summary || "").trim() || String(p.title || "").trim();

        const cover = String(p.cover ?? "").trim();
        const coverHtml = cover
          ? `<p><img src="${escapeXmlText(cover)}" alt="cover" /></p>`
          : "";

        const bodyHtml = String(p.html ?? "");
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
