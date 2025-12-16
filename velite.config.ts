import { defineCollection, defineConfig, defineLoader, s } from "velite";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { load } from "cheerio";
import YAML from "yaml";

const toBase64 = (input: string) => Buffer.from(input, "utf8").toString("base64");

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatHugoDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mi = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+0800`;
};

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

const ensureTrailingSlash = (p: string) => (p.endsWith("/") ? p : `${p}/`);
const ensureLeadingSlash = (p: string) => (p.startsWith("/") ? p : `/${p}`);

const jsxifyVoidTags = (html: string) =>
  html.replace(/<(Img|img|br|hr)\b([^>]*)>/g, (m, tag, attrs) => {
    const a = String(attrs ?? "");
    if (a.trim().endsWith("/")) return `<${tag}${a}>`;
    return `<${tag}${a} />`;
  });

const rehypeCodeblockToPre = () => {
  return (tree: any) => {
    visit(tree, "element", (node: any, index: number | undefined, parent: any) => {
      if (!parent || typeof index !== "number") return;
      if (node?.tagName !== "pre") return;
      const code = node.children?.find((c: any) => c?.type === "element" && c?.tagName === "code");
      if (!code) return;

      const className = code.properties?.className;
      let lang: string | undefined;
      if (Array.isArray(className)) {
        const cls = className.find((x) => typeof x === "string" && x.startsWith("language-"));
        if (typeof cls === "string") lang = cls.slice("language-".length);
      } else if (typeof className === "string" && className.startsWith("language-")) {
        lang = className.slice("language-".length);
      }
      lang ??= "plaintext";

      const codeText =
        code.children?.map((c: any) => (c?.type === "text" ? c.value : "")).join("") ?? "";

      parent.children[index] = {
        type: "element",
        tagName: "Pre",
        properties: { lang },
        children: [
          {
            type: "element",
            tagName: "code",
            properties: {},
            children: [{ type: "text", value: toBase64(codeText) }],
          },
        ],
      };
    });
  };
};

const rehypeImgToComponent = () => {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (node?.tagName !== "img") return;
      node.tagName = "Img";
    });
  };
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

const countWordsLikeExisting = (plain: string) => {
  const asciiWords = (plain.match(/[A-Za-z0-9_]+/g) || []).length;
  const cjkChars = (plain.match(/[\u4e00-\u9fff]/g) || []).length;
  const others = plain.length - cjkChars;
  return asciiWords + cjkChars * 0.6 + Math.max(0, others - asciiWords * 2) * 0;
};

const readSiteConf = async (repoRoot: string) => {
  const raw = await fs.readFile(path.join(repoRoot, "hugo.json"), "utf8");
  const cfg = JSON.parse(raw);
  return {
    baseURL: String(cfg.baseURL ?? "").replace(/\/$/, ""),
    title: String(cfg.title ?? ""),
    description: String(cfg.description ?? ""),
    author: String(cfg.params?.author ?? ""),
    sitemap: {
      changeFreq: String(cfg.params?.sitemap?.changeFreq ?? "weekly"),
      priority: Number(cfg.params?.sitemap?.priority ?? 0.6),
      termPriority: Number(cfg.params?.sitemap?.termPriority ?? 0.3),
    },
  };
};

const uuidFromSha1 = (hex: string) =>
  `urn:uuid:${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 17)}9${hex.slice(17, 19)}-${hex.slice(21, 33)}`;

const writeFile = async (filepath: string, content: string) => {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, content, "utf8");
};

const writeJson = async (filepath: string, data: unknown) => {
  await writeFile(filepath, `${JSON.stringify(data, null, 2)}\n`);
};

const writeExportDefaultObject = async (filepath: string, data: unknown) => {
  await writeFile(filepath, `export default ${JSON.stringify(data, null, 2)}\n`);
};

const MATTER_RE =
  /^---(?:\r?\n|\r)(?:([\s\S]*?)(?:\r?\n|\r))?---(?:\r?\n|\r|$)/;

const dedupeFrontmatterScalars = (frontmatter: string) => {
  const lines = frontmatter.split(/\r?\n/);
  const lastIndex = new Map<string, number>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = /^([A-Za-z0-9_-]+):\s*(.+)\s*$/.exec(line);
    if (!match) continue;
    const key = match[1];
    lastIndex.set(key, i);
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
      rehypePlugins: [rehypeSlug, rehypeCodeblockToPre, rehypeImgToComponent],
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
      rehypePlugins: [rehypeSlug, rehypeCodeblockToPre, rehypeImgToComponent],
    }),
    tocEntries: s.toc({ maxDepth: 5 }),
  }),
});

export default defineConfig({
  root: "hugo/content",
  loaders: [matterLoader],
  collections: {
    posts: Post,
    pages: Page,
  },
  output: {
    data: ".velite",
    clean: true,
  },
  prepare: async (data, context) => {
    const repoRoot = path.dirname(context.config.configPath);
    const site = await readSiteConf(repoRoot);
    const outDir = path.join(repoRoot, "(hugo)");

    await fs.rm(outDir, { recursive: true, force: true });
    await fs.mkdir(outDir, { recursive: true });

    const posts = (data.posts as any[]).map((p) => {
      const date = parseDateLikeHugo(p.date);
      const updated = parseDateLikeHugo(p.updated ?? p.date);
      const contentWithMarker = jsxifyVoidTags(String(p.contentHtml ?? ""));
      const markerRe = /<!--\s*more\s*-->/i;
      const markerReGlobal = /<!--\s*more\s*-->/gi;
      const markerIdx = contentWithMarker.search(markerRe);
      const summaryHtml =
        markerIdx >= 0 ? contentWithMarker.slice(0, markerIdx) : contentWithMarker;
      const content = markerIdx >= 0 ? contentWithMarker.replace(markerReGlobal, "") : contentWithMarker;

      const summary = plainifyHtml(summaryHtml).slice(0, 260);
      const tags = Array.isArray(p.tags) ? p.tags.map(String) : [];
      const category = p.category ? String(p.category) : "";
      const cover = p.cover ? String(p.cover) : "";
      const words = countWordsLikeExisting(plainifyHtml(content));
      const toc = tocToHtml(Array.isArray(p.tocEntries) ? p.tocEntries : []);

      return {
        ...p,
        dateObj: date,
        updatedObj: updated,
        content,
        summary,
        tags,
        category,
        cover,
        words,
        toc,
      };
    });

    const pages = (data.pages as any[]).map((p) => {
      const date = parseDateLikeHugo(p.date);
      const updated = parseDateLikeHugo(p.updated ?? p.date);
      const contentWithMarker = jsxifyVoidTags(String(p.contentHtml ?? ""));
      const markerRe = /<!--\s*more\s*-->/i;
      const markerReGlobal = /<!--\s*more\s*-->/gi;
      const markerIdx = contentWithMarker.search(markerRe);
      const summaryHtml =
        markerIdx >= 0 ? contentWithMarker.slice(0, markerIdx) : contentWithMarker;
      const content = markerIdx >= 0 ? contentWithMarker.replace(markerReGlobal, "") : contentWithMarker;

      const summary = plainifyHtml(summaryHtml).slice(0, 260);
      const cover = p.cover ? String(p.cover) : "";
      const toc = tocToHtml(Array.isArray(p.tocEntries) ? p.tocEntries : []);
      return {
        ...p,
        dateObj: date,
        updatedObj: updated,
        content,
        summary,
        cover,
        toc,
      };
    });

    const postsByDateDesc = [...posts].sort(
      (a, b) => b.dateObj.getTime() - a.dateObj.getTime(),
    );
    const renderablePostsByDateDesc = postsByDateDesc.filter((p) => p.draft !== true);
    const renderablePages = pages.filter((p) => p.draft !== true);

    const publishedPosts = postsByDateDesc.filter(
      (p) => p.draft !== true && p.private !== true && p.isTranslation !== true,
    );
    const publishedPages = [...pages]
      .filter((p) => p.draft !== true && p.private !== true && p.isTranslation !== true)
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

    const neighboursSource = publishedPosts;
    const neighboursBySlug = new Map<string, any>();
    neighboursSource.forEach((p, idx) => {
      const prev = neighboursSource[idx - 1];
      const next = neighboursSource[idx + 1];
      const toLink = (x: any) =>
        x
          ? {
              title: String(x.title),
              slug: `/posts/${String(x.slug)}/`,
            }
          : undefined;
      const n: any = {};
      if (prev) n.prev = toLink(prev);
      if (next) n.next = toLink(next);
      neighboursBySlug.set(String(p.slug), n);
    });

    const categoryToPosts = new Map<string, any[]>();
    const tagToPosts = new Map<string, any[]>();

    for (const p of publishedPosts) {
      if (p.category) {
        const key = String(p.category);
        const list = categoryToPosts.get(key) ?? [];
        list.push(p);
        categoryToPosts.set(key, list);
      }
      for (const t of p.tags ?? []) {
        const key = String(t);
        const list = tagToPosts.get(key) ?? [];
        list.push(p);
        tagToPosts.set(key, list);
      }
    }

    const latestUpdated = (items: any[]) =>
      items.reduce((acc, x) => Math.max(acc, x.updatedObj?.getTime?.() ?? 0), 0);

    const postListJson = {
      type: "posts",
      term: "Posts",
      pages: publishedPosts.map((p, idx) => {
        const base: any = {
          title: String(p.title),
          slug: String(p.slug),
          words: p.words,
          category: String(p.category ?? ""),
          date: formatHugoDate(p.dateObj),
        };
        if (p.subtitle) base.subtitle = String(p.subtitle);
        if (p.lang) base.lang = String(p.lang);
        if (idx === 0 && p.cover) base.cover = String(p.cover);
        return base;
      }),
    };

    const baseListJson = {
      type: "base",
      term: "Pages",
      pages: publishedPages.map((p, idx) => {
        const base: any = {
          title: String(p.title),
          slug: String(p.slug),
          words: 0,
          category: "",
          date: formatHugoDate(p.dateObj),
        };
        if (p.lang) base.lang = String(p.lang);
        if (p.subtitle) base.subtitle = String(p.subtitle);
        if (idx === 0 && p.cover) base.cover = String(p.cover);
        return base;
      }),
    };

    const homeJson = {
      type: "home",
      term: "Home",
      pages: publishedPosts.slice(0, 5).map((p, idx) => {
        const base: any = {
          title: String(p.title),
          subtitle: p.subtitle ? String(p.subtitle) : "",
          slug: `/posts/${String(p.slug)}/`,
          cover: String(p.cover ?? ""),
          category: String(p.category ?? ""),
          date: formatHugoDate(p.dateObj),
        };
        if (idx === 0) base.summary = p.summary.replaceAll(" ", "");
        return base;
      }),
    };

    const categoryIndexJson = {
      term: "Category",
      pages: Array.from(categoryToPosts.entries()).map(([title, pages]) => ({
        title,
        count: pages.length,
      })),
    };
    const tagsIndexJson = {
      term: "Tags",
      pages: Array.from(tagToPosts.entries()).map(([title, pages]) => ({
        title,
        count: pages.length,
      })),
    };

    await writeJson(path.join(outDir, "index.json"), homeJson);
    await writeJson(path.join(outDir, "posts", "index.json"), postListJson);
    await writeJson(path.join(outDir, "base", "index.json"), baseListJson);
    await writeJson(path.join(outDir, "category", "index.json"), categoryIndexJson);
    await writeJson(path.join(outDir, "tags", "index.json"), tagsIndexJson);

    for (const p of renderablePostsByDateDesc) {
      const slug = String(p.slug);
      const detailed: any = {
        title: String(p.title),
        date: formatHugoDate(p.dateObj),
        updated: formatHugoDate(p.updatedObj),
        cover: String(p.cover ?? ""),
        slug: ensureTrailingSlash(`/posts/${slug}`),
        tags: p.tags ?? [],
        category: String(p.category ?? ""),
        summary: p.summary,
        words: p.words,
        content: p.content,
        toc: p.toc,
        neighbours: neighboursBySlug.get(slug) ?? {},
      };
      if (p.subtitle) detailed.subtitle = String(p.subtitle);
      if (p.encrypt_pwd) detailed.password = String(p.encrypt_pwd);
      if (p.mathrender) detailed.mathrender = true;
      if (p.isTranslation !== undefined) detailed.isTranslation = Boolean(p.isTranslation);
      if (p.lang) detailed.lang = String(p.lang);

      await writeExportDefaultObject(
        path.join(outDir, "posts", slug, "index.jsx"),
        detailed,
      );
    }

    for (const p of pages) {
      if (p.draft === true) continue;
      const slug = String(p.slug);
      const detailed: any = {
        title: String(p.title),
        date: formatHugoDate(p.dateObj),
        updated: formatHugoDate(p.updatedObj),
        slug: ensureTrailingSlash(ensureLeadingSlash(slug)),
        summary: p.summary,
        cover: p.cover ? String(p.cover) : undefined,
        content: p.content,
      };
      if (p.isTranslation !== undefined) detailed.isTranslation = Boolean(p.isTranslation);
      if (p.lang) detailed.lang = String(p.lang);

      await writeExportDefaultObject(path.join(outDir, slug, "index.jsx"), detailed);
    }

    for (const [category, postsForCate] of categoryToPosts.entries()) {
      const termJson = {
        term: category,
        pages: postsForCate.map((p) => {
          const base: any = {
            title: String(p.title),
            slug: `/posts/${String(p.slug)}/`,
            cover: String(p.cover ?? ""),
            words: p.words,
            category: String(p.category ?? ""),
            date: formatHugoDate(p.dateObj),
          };
          if (p.subtitle) base.subtitle = String(p.subtitle);
          return base;
        }),
      };
      await writeExportDefaultObject(
        path.join(outDir, "category", category, "index.jsx"),
        termJson,
      );
    }

    for (const [tag, postsForTag] of tagToPosts.entries()) {
      const termJson = {
        term: tag,
        pages: postsForTag.map((p) => {
          const base: any = {
            title: String(p.title),
            slug: `/posts/${String(p.slug)}/`,
            cover: String(p.cover ?? ""),
            words: p.words,
            category: String(p.category ?? ""),
            date: formatHugoDate(p.dateObj),
          };
          if (p.subtitle) base.subtitle = String(p.subtitle);
          return base;
        }),
      };
      await writeExportDefaultObject(path.join(outDir, "tags", tag, "index.jsx"), termJson);
    }

    const sitemapHeader =
      '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';
    const sitemapIndex = `${sitemapHeader}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      [
        { section: "posts", lastmod: latestUpdated(renderablePostsByDateDesc) },
        { section: "base", lastmod: latestUpdated(renderablePages) },
      ]
        .map(
          (s) =>
            `  <sitemap>\n    <loc>${site.baseURL}/${s.section}/sitemap.xml</loc>\n    <lastmod>${formatUtc(new Date(s.lastmod || Date.now()))}</lastmod>\n  </sitemap>`,
        )
        .join("\n") +
      `\n  <sitemap>\n    <loc>${site.baseURL}/category/sitemap.xml</loc>\n    <lastmod>${formatUtc(new Date(Date.now()))}</lastmod>\n  </sitemap>\n</sitemapindex>\n`;
    await writeFile(path.join(outDir, "sitemap.xml"), sitemapIndex);

    const urlsetStart = (extraNs: string) =>
      `${sitemapHeader}\n<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ${extraNs}xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const urlsetEnd = `</urlset>\n`;

    const postSitemap =
      urlsetStart('xmlns:xhtml="http://www.w3.org/1999/xhtml" ') +
      `  <url>\n    <loc>${site.baseURL}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1</priority>\n  </url>\n` +
      renderablePostsByDateDesc
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
    await writeFile(path.join(outDir, "posts", "sitemap.xml"), postSitemap);

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
    await writeFile(path.join(outDir, "base", "sitemap.xml"), baseSitemap);

    const categorySitemap =
      urlsetStart("") +
      Array.from(categoryToPosts.keys())
        .map((c) => {
          const loc = `${site.baseURL}/category/${c}/`;
          return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${formatUtc(new Date())}</lastmod>\n    <changefreq>${site.sitemap.changeFreq}</changefreq>\n    <priority>${site.sitemap.termPriority}</priority>\n  </url>`;
        })
        .join("\n") +
      `\n${urlsetEnd}`;
    await writeFile(path.join(outDir, "category", "sitemap.xml"), categorySitemap);

    const feedId = uuidFromSha1(crypto.createHash("sha1").update(site.baseURL).digest("hex"));
    const feedUpdated = formatUtc(
      new Date(Math.max(latestUpdated(renderablePostsByDateDesc), Date.now())),
    );
    const atomEntries = publishedPosts
      .map((p) => {
        const url = `${site.baseURL}/posts/${String(p.slug)}/`;
        const id = uuidFromSha1(crypto.createHash("sha1").update(url).digest("hex"));
        const title = String(p.title).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
        const published = p.dateObj.toISOString();
        const updated = p.updatedObj.toISOString();
        const summary =
          p.encrypt_pwd
            ? "抱歉，本文已加密，请至网站输入密码后阅读。"
            : `<![CDATA[<img src=\"${String(p.cover ?? "")}\" alt=\"cover\" />${p.content}]]>`;
        return `  <entry>\n    <title type=\"text\">${title}</title>\n    <link rel=\"alternate\" type=\"type/html\" href=\"${url}\" />\n    <id>${id}</id>\n    <published>${published}</published>\n    <updated>${updated}</updated>\n    <summary type=\"html\" src=\"${url}\">${summary}</summary>\n  </entry>`;
      })
      .join("\n");
    const atom =
      `<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\" ?>\n` +
      `<?xml-stylesheet type=\"text/css\" href=\"/sass/atom.css\" ?>\n` +
      `<feed xmlns=\"http://www.w3.org/2005/Atom\" xml:base=\"${site.baseURL}\">\n` +
      `  <title>${site.title} ATOM</title>\n` +
      `  <link href=\"${site.baseURL}/atom.xml\" rel=\"self\" type=\"application/atom+xml\" />\n` +
      `  <author><name>${site.author}</name></author>\n` +
      `  <updated>${feedUpdated}</updated>\n` +
      `  <id>${feedId}</id>\n` +
      atomEntries +
      `\n</feed>\n`;
    await writeFile(path.join(outDir, "atom.xml"), atom);

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
    await writeFile(path.join(outDir, "manifest.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);

    await writeFile(
      path.join(outDir, "sass", "atom.css"),
      `body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;max-width:860px;margin:2rem auto;line-height:1.6;padding:0 1rem;color:#111}a{color:#065279;text-decoration:none}img{max-width:100%}pre{white-space:pre-wrap}\n`,
    );

    return false;
  },
});
