const semanticTokenColors = [
  {
    scope: ["comment", "punctuation.definition.comment", "string.comment"],
    settings: { foreground: "var(--code-comment)" },
  },
  {
    scope: [
      "string",
      "constant.character",
      "constant.numeric",
      "constant.language",
      "constant.other.symbol",
      "constant.other.key",
      "constant.other.placeholder",
      "constant.other.path",
    ],
    settings: { foreground: "var(--code-literal)" },
  },
  {
    scope: [
      "keyword.control",
      "keyword.declaration",
      "keyword.directive",
      "keyword.operator.word",
      "storage.type",
      "storage.modifier",
    ],
    settings: { foreground: "var(--code-keyword)" },
  },
  {
    scope: [
      "entity.name.type",
      "entity.name.class",
      "entity.name.interface",
      "entity.name.enum",
      "entity.name.struct",
      "entity.name.trait",
      "entity.name.namespace",
      "support.type",
    ],
    settings: { foreground: "var(--code-type)" },
  },
  {
    scope: ["punctuation", "meta.brace", "meta.delimiter", "keyword.operator"],
    settings: { foreground: "var(--code-muted)" },
  },
];

const createSemanticTheme = () => ({
  name: "inkstone-semantic",
  type: "light",
  colors: {
    "editor.background": "var(--code-bg)",
    "editor.foreground": "var(--code-fg)",
  },
  tokenColors: semanticTokenColors,
});

export const shikiTheme = createSemanticTheme();
export const shikiThemeList = [shikiTheme] as const;
