import { describe, expect, test } from "bun:test";
import { wrapCodeBlock } from "../tools/velite/codeBlocks";

describe("wrapCodeBlock", () => {
  test("wraps pre with code-block container only", () => {
    const pre = {
      type: "element",
      tagName: "pre",
      children: [
        {
          type: "element",
          tagName: "code",
          properties: { class: ["language-ts"] },
          children: [{ type: "text", value: "const a = 1" }],
        },
      ],
    };

    const wrapped = wrapCodeBlock(pre as any);
    expect(wrapped).not.toBeNull();
    expect(wrapped?.tagName).toBe("div");
    expect(wrapped?.properties?.class).toEqual(["code-block"]);
    expect(wrapped?.children?.[0]?.tagName).toBe("pre");
  });

  test("falls back to text label when language missing", () => {
    const pre = {
      type: "element",
      tagName: "pre",
      children: [
        {
          type: "element",
          tagName: "code",
          properties: {},
          children: [{ type: "text", value: "plain" }],
        },
      ],
    };

    const wrapped = wrapCodeBlock(pre as any);
    const lang = wrapped?.properties?.["data-lang"];
    expect(lang).toBe("text");
  });

  test("uses pre data-lang when available", () => {
    const pre = {
      type: "element",
      tagName: "pre",
      properties: { "data-lang": "python" },
      children: [
        {
          type: "element",
          tagName: "code",
          properties: {},
          children: [{ type: "text", value: "print('hi')" }],
        },
      ],
    };

    const wrapped = wrapCodeBlock(pre as any);
    expect(wrapped?.properties?.["data-lang"]).toBe("python");
  });

  test("reads language from class property", () => {
    const pre = {
      type: "element",
      tagName: "pre",
      children: [
        {
          type: "element",
          tagName: "code",
          properties: { class: ["language-go"] },
          children: [{ type: "text", value: "package main" }],
        },
      ],
    };

    const wrapped = wrapCodeBlock(pre as any);
    expect(wrapped?.properties?.["data-lang"]).toBe("go");
  });

  test("normalizes className to class before inferring", () => {
    const pre = {
      type: "element",
      tagName: "pre",
      children: [
        {
          type: "element",
          tagName: "code",
          properties: { className: ["language-rust"] },
          children: [{ type: "text", value: "fn main() {}" }],
        },
      ],
    };

    const wrapped = wrapCodeBlock(pre as any);
    expect(wrapped?.properties?.["data-lang"]).toBe("rust");
  });
});
