import { performance } from "node:perf_hooks";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { unified } from "@astrojs/markdown-remark";
import { isCodeBlockWrapper, wrapCodeBlock } from "./codeBlocks";
import { createSemanticTheme } from "./shikiThemes";
import { remarkBlogMetadata, rehypeBlogMetadata, rehypeKeepPublicImages } from "./metadata";

type TimingEntry = { total: number; count: number };
const markdownTiming = new Map<string, TimingEntry>();
const recordTiming = (name: string, durationMs: number) => {
  const prev = markdownTiming.get(name) ?? { total: 0, count: 0 };
  markdownTiming.set(name, { total: prev.total + durationMs, count: prev.count + 1 });
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
      `content:markdown:${name}: ${value.total.toFixed(3)}ms (${value.count})`,
    );
  });
  markdownTiming.clear();
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



// Astro owns the parser, heading IDs, Shiki instance and language loading.
// Keep only blog-specific presentation and metadata plugins.
export const markdownOptions = {
  syntaxHighlight: 'shiki' as const,
  shikiConfig: { theme: createSemanticTheme(), wrap: null },
  processor: unified({
    smartypants: false,
    remarkPlugins: [[remarkMath, { singleDollarTextMath: false }], remarkBlogMetadata],
    rehypePlugins: [
      rehypeBlogMetadata,
      withTiming("rehype:blog-enhancements", rehypeBlogEnhancements),
      withTiming("rehype:code-wrapper", rehypeCodeBlockWrapper),
      [withTiming("rehype:katex", rehypeKatex), { strict: "warn" }],
      rehypeKeepPublicImages,
    ],
  }),
};
