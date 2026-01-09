import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import rehypeShiki from "@shikijs/rehype";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import { bundledLanguages, getSingletonHighlighter } from "shiki";
import { isCodeBlockWrapper, wrapCodeBlock } from "./codeBlocks";
import { shikiTheme, shikiThemeList } from "./shikiThemes";

type TimingEntry = { total: number; count: number };

const markdownTiming = new Map<string, TimingEntry>();

let shikiInitPromise: Promise<unknown> | null = null;

const DRAFT_FRONTMATTER_RE = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(\r?\n|$)/;
const DRAFT_FLAG_RE = /(^|\r?\n)\s*draft\s*:\s*true\b/i;

const resolveContentDir = () => {
  const cwdDir = path.resolve(process.cwd(), "_blogs", "content");
  if (fs.existsSync(cwdDir)) return cwdDir;
  const repoDir = path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));
  const fallbackDir = path.join(repoDir, "_blogs", "content");
  if (fs.existsSync(fallbackDir)) return fallbackDir;
  return null;
};

const isDraftMarkdown = (content: string) => {
  const match = DRAFT_FRONTMATTER_RE.exec(content);
  if (!match) return false;
  return DRAFT_FLAG_RE.test(match[1] ?? "");
};

const collectFenceLangs = () => {
  const contentDir = resolveContentDir();
  if (!contentDir) return { ok: false, langs: [] as string[] };
  const langs = new Set<string>();
  try {
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(entryPath);
          continue;
        }
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith(".md")) continue;
        const content = fs.readFileSync(entryPath, "utf8");
        if (isDraftMarkdown(content)) continue;
        const re = /^[ \t]*```([A-Za-z0-9_+-]+)[ \t]*$/gm;
        let match: RegExpExecArray | null;
        while ((match = re.exec(content)) !== null) {
          const raw = String(match[1] ?? "").trim();
          if (!raw) continue;
          langs.add(raw);
        }
      }
    };
    walk(contentDir);
    return { ok: true, langs: Array.from(langs) };
  } catch {
    return { ok: false, langs: [] as string[] };
  }
};

const buildShikiLangConfig = () => {
  const scan = collectFenceLangs();
  const allLangs = Object.keys(bundledLanguages);
  if (!scan.ok || scan.langs.length === 0) {
    return { langs: allLangs, alias: {} as Record<string, string> };
  }

  const known = new Set(allLangs);
  const fallback =
    (known.has("text") && "text") ||
    (known.has("plaintext") && "plaintext") ||
    allLangs[0];
  const alias: Record<string, string> = {};
  const out = new Set<string>([fallback]);
  const unknown: string[] = [];

  for (const raw of scan.langs) {
    const normalized = raw.toLowerCase();
    const canonical = known.has(normalized)
      ? normalized
      : known.has(raw)
        ? raw
        : null;
    if (canonical) {
      out.add(canonical);
      if (raw !== canonical) alias[raw] = canonical;
    } else {
      alias[raw] = fallback;
      if (!unknown.includes(raw)) unknown.push(raw);
    }
  }

  if (unknown.length) {
    console.warn(
      `[velite] Unknown fenced code languages: ${unknown.join(", ")}; using ${fallback}`,
    );
  }

  return { langs: Array.from(out).sort(), alias };
};

const shikiLangConfig = buildShikiLangConfig();

const recordTiming = (name: string, durationMs: number) => {
  const prev = markdownTiming.get(name) ?? { total: 0, count: 0 };
  markdownTiming.set(name, {
    total: prev.total + durationMs,
    count: prev.count + 1,
  });
};

const prewarmShiki = () => {
  if (shikiInitPromise) return;
  const start = performance.now();
  shikiInitPromise = getSingletonHighlighter({
    themes: shikiThemeList,
    langs: shikiLangConfig.langs,
    langAlias: shikiLangConfig.alias,
  })
    .then(() => {
      recordTiming("rehype:shiki:init", performance.now() - start);
    })
    .catch((error) => {
      recordTiming("rehype:shiki:init", performance.now() - start);
      throw error;
    });
};

const withTiming =
  <T extends (...args: any[]) => any>(name: string, plugin: T) =>
  function (this: unknown, ...args: Parameters<T>) {
    const transformer = plugin.apply(this, args);
    if (typeof transformer !== "function") return transformer;
    return function (this: unknown, tree: unknown, file: unknown) {
      const start = performance.now();
      const finalize = () => recordTiming(name, performance.now() - start);
      try {
        const result = transformer.call(this, tree, file);
        if (result && typeof (result as Promise<unknown>).then === "function") {
          return (result as Promise<unknown>).then(
            (value) => {
              finalize();
              return value;
            },
            (error) => {
              finalize();
              throw error;
            },
          );
        }
        finalize();
        return result;
      } catch (error) {
        finalize();
        throw error;
      }
    };
  };

export const reportMarkdownTiming = () => {
  if (!markdownTiming.size) return;
  const entries = Array.from(markdownTiming.entries()).sort((a, b) => b[1].total - a[1].total);
  entries.forEach(([name, value]) => {
    console.log(
      `velite:markdown:${name}: ${value.total.toFixed(3)}ms (${value.count})`,
    );
  });
  markdownTiming.clear();
};

const normalizeWhitespace = (value: string) =>
  String(value ?? "").replace(/\s+/g, " ").trim();

const countWords = (input: string) => {
  const text = input.normalize("NFKC");
  const han = (text.match(/\p{Script=Han}/gu) || []).length;
  const latinWords = (text.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) || []).length;

  return han + latinWords;
};

const tocToHtml = (entries: Array<{ title: string; url: string; items: any[] }>) => {
  if (!entries || entries.length === 0) return "";
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

const MORE_MARKER_RE = /<!--\s*more\s*-->/i;

const getClassList = (node: any) => {
  const props = node?.properties;
  if (props && props.className != null && props.class == null) {
    const raw = props.className;
    props.class = Array.isArray(raw) ? raw : String(raw);
  }
  if (props?.className != null) delete props.className;
  const cn = props?.class;
  if (Array.isArray(cn)) return cn.map(String).filter(Boolean);
  if (typeof cn === "string") return cn.split(/\s+/).filter(Boolean);
  return [];
};

const rehypeBlogEnhancements = () => {
  return (tree: any) => {
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

    const walk = (node: any) => {
      if (!node) return;
      const isElement = node.type === "element";
      const tag = isElement ? String(node.tagName || "").toLowerCase() : "";

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
            properties: { class: ["table-wrapper"] },
            children: [child],
          };
          node.children.splice(i, 1, wrapper);
          walk(wrapper);
          continue;
        }

        walk(child);
      }
    };

    walk(tree);
  };
};

const rehypeCodeLangAttr = () => {
  const inferLang = (node: any) => {
    const classes = getClassList(node);
    for (const c of classes) {
      const m = /^language-(.+)$/.exec(c);
      if (m?.[1]) return m[1];
    }
    for (const c of classes) {
      const m = /^lang(?:uage)?-(.+)$/.exec(c);
      if (m?.[1]) return m[1];
    }
    return undefined;
  };

  return (tree: any) => {
    const walk = (node: any, parentTag?: string) => {
      if (!node) return;
      if (node.type === "element") {
        const tag = String(node.tagName || "").toLowerCase();
        if (tag === "code" && parentTag === "pre") {
          node.properties ??= {};
          const lang = inferLang(node);
          if (lang && !node.properties["data-lang"]) node.properties["data-lang"] = lang;
        }
        if (tag === "pre") {
          node.properties ??= {};
          const codeChild = node.children?.find(
            (child: any) => child?.type === "element" && String(child.tagName || "").toLowerCase() === "code",
          );
          const lang = codeChild ? inferLang(codeChild) : inferLang(node);
          if (lang && !node.properties["data-lang"]) node.properties["data-lang"] = lang;
        }
        if (Array.isArray(node.children)) {
          for (const child of node.children) walk(child, tag);
        }
      } else if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child, parentTag);
      }
    };
    walk(tree, undefined);
  };
};

const rehypeCodeBlockWrapper = () => {
  return (tree: any) => {
    const walk = (node: any) => {
      if (!node || !Array.isArray(node.children)) return;
      for (let i = 0; i < node.children.length; i += 1) {
        const child = node.children[i];
        if (child?.type === "element") {
          const tag = String(child.tagName || "").toLowerCase();
          if (tag === "pre" && !isCodeBlockWrapper(node)) {
            const wrapped = wrapCodeBlock(child);
            if (wrapped) {
              node.children[i] = wrapped;
              continue;
            }
          }
        }
        walk(child);
      }
    };
    walk(tree);
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

export const md = {
  remarkPlugins: [[withTiming("remark:math", remarkMath), { singleDollarTextMath: false }]] as any,
  rehypePlugins: [
    withTiming("rehype:slug", rehypeSlug),
    withTiming("rehype:blog-enhancements", rehypeBlogEnhancements),
    [
      withTiming("rehype:shiki", rehypeShiki),
      {
        theme: shikiTheme,
        langs: shikiLangConfig.langs,
        langAlias: shikiLangConfig.alias,
        addLanguageClass: true,
      },
    ],
    withTiming("rehype:code-lang", rehypeCodeLangAttr),
    withTiming("rehype:code-wrapper", rehypeCodeBlockWrapper),
    [withTiming("rehype:katex", rehypeKatex), { strict: "warn" }],
  ] as any,
};

prewarmShiki();

export const transforms = {
  tocToHtml,
  summaryFromMeta,
  getMetaFromZodCtx,
  countWords,
  normalizeWhitespace,
};
