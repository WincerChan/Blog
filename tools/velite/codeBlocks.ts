type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const getClassList = (node: HastNode) => {
  const props = node?.properties;
  if (props && props.className != null && props.class == null) {
    const raw = props.className;
    props.class = Array.isArray(raw) ? raw : String(raw);
  }
  if (props?.className != null) delete props.className;
  const cn = node?.properties?.class;
  if (Array.isArray(cn)) return cn.map(String).filter(Boolean);
  if (typeof cn === "string") return cn.split(/\s+/).filter(Boolean);
  return [];
};

const inferCodeLang = (preNode: HastNode, codeNode: HastNode) => {
  const dataLang =
    preNode?.properties?.["data-lang"] ??
    preNode?.properties?.["data-language"] ??
    preNode?.properties?.["dataLanguage"] ??
    codeNode?.properties?.["data-lang"];
  if (typeof dataLang === "string" && dataLang.trim()) return dataLang.trim();
  const allClasses = [...getClassList(preNode), ...getClassList(codeNode)];
  for (const c of allClasses) {
    const m = /^language-(.+)$/.exec(c);
    if (m?.[1]) return m[1];
  }
  for (const c of allClasses) {
    const m = /^lang(?:uage)?-(.+)$/.exec(c);
    if (m?.[1]) return m[1];
  }
  return "";
};

const normalizeLangLabel = (lang: string) => {
  const trimmed = String(lang ?? "").trim();
  return trimmed ? trimmed.toLowerCase() : "text";
};

const appendClasses = (node: HastNode, classes: string[]) => {
  if (!node) return;
  const current = getClassList(node);
  const merged = Array.from(new Set([...current, ...classes]));
  node.properties ??= {};
  node.properties.class = merged;
};

const appendInlineStyle = (node: HastNode, styleText: string) => {
  if (!node) return;
  node.properties ??= {};
  const style = node.properties.style;
  if (typeof style === "string") {
    if (!style.includes("margin-top")) {
      node.properties.style = `${style.replace(/\s*;?\s*$/, "")};${styleText}`;
    }
    return;
  }
  if (style && typeof style === "object") {
    (style as Record<string, string>)["margin-top"] = "0";
    node.properties.style = style;
    return;
  }
  node.properties.style = styleText;
};

export const isCodeBlockWrapper = (node: HastNode) => {
  const tag = String(node?.tagName || "").toLowerCase();
  if (node?.type !== "element" || tag !== "div") return false;
  return getClassList(node).includes("code-block");
};

export const wrapCodeBlock = (preNode: HastNode) => {
  const tag = String(preNode?.tagName || "").toLowerCase();
  if (preNode?.type !== "element" || tag !== "pre") return null;
  const codeNode = (preNode.children || []).find(
    (child) => child?.type === "element" && String(child.tagName || "").toLowerCase() === "code",
  );
  if (!codeNode) return null;
  const langLabel = normalizeLangLabel(inferCodeLang(preNode, codeNode));
  appendInlineStyle(preNode, "margin-top:0");

  const headerNode: HastNode = {
    type: "element",
    tagName: "div",
    properties: {
      class: ["code-header"],
      style: "min-height:44px;",
    },
    children: [],
  };

  return {
    type: "element",
    tagName: "div",
    properties: {
      class: ["code-block"],
      "data-lang": langLabel,
    },
    children: [headerNode, preNode],
  } as HastNode;
};
