import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";

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
  const cn = node?.properties?.className;
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
            properties: { className: ["table-wrapper"] },
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
  remarkPlugins: [[remarkMath, { singleDollarTextMath: false }]] as any,
  rehypePlugins: [
    rehypeSlug,
    rehypeBlogEnhancements,
    [rehypeHighlight, { ignoreMissing: true }],
    rehypeCodeLangAttr,
    [rehypeKatex, { strict: "warn" }],
  ] as any,
};

export const transforms = {
  tocToHtml,
  summaryFromMeta,
  getMetaFromZodCtx,
  countWords,
  normalizeWhitespace,
};
