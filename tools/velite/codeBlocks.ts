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

const phIcon = (classToken: string, pathData: string) => ({
  type: "element",
  tagName: "svg",
  properties: {
    class: [classToken],
    viewBox: "0 0 256 256",
    "aria-hidden": "true",
  },
  children: [
    {
      type: "element",
      tagName: "path",
      properties: {
        d: pathData,
        fill: "currentColor",
      },
      children: [],
    },
  ],
});

const PH_COPY_PATH =
  "M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z";

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

  const header: HastNode = {
    type: "element",
    tagName: "div",
    properties: { class: ["code-header"] },
    children: [
      {
        type: "element",
        tagName: "span",
        properties: { class: ["code-lang"] },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { class: ["code-lang-text"] },
            children: [{ type: "text", value: langLabel }],
          },
        ],
      },
      {
        type: "element",
        tagName: "button",
        properties: {
          type: "button",
          class: ["code-copy"],
          "data-code-copy": "true",
          "data-copy-label": "Copy",
          "data-copied-label": "Copied",
          title: "Copy",
        },
        children: [
          phIcon("code-copy-icon", PH_COPY_PATH),
          {
            type: "element",
            tagName: "span",
            properties: { class: ["code-copy-text"] },
            children: [{ type: "text", value: "Copy" }],
          },
        ],
      },
    ],
  };

  return {
    type: "element",
    tagName: "div",
    properties: { class: ["code-block"], "data-lang": langLabel },
    children: [header, preNode],
  } as HastNode;
};
