import { describe, expect, test } from "bun:test";
import {
  normalizeLabel,
  normalizeLangLabel,
  resolveCopyLabel,
} from "../src/features/article/components/CodeBlockHeader";
import { writeClipboardText } from "../src/utils/clipboard";

describe("normalizeLangLabel", () => {
  test("returns lowercase language when present", () => {
    expect(normalizeLangLabel(" TypeScript ")).toBe("typescript");
  });

  test("falls back to text when empty", () => {
    expect(normalizeLangLabel("")).toBe("text");
    expect(normalizeLangLabel(null)).toBe("text");
  });
});

describe("resolveCopyLabel", () => {
  test("returns copy label when not copied", () => {
    expect(resolveCopyLabel(false, "Copy Code", "Copied")).toBe("Copy Code");
  });

  test("returns copied label when copied", () => {
    expect(resolveCopyLabel(true, "Copy Code", "Copied")).toBe("Copied");
  });
});

describe("normalizeLabel", () => {
  test("uses fallback when label is empty", () => {
    expect(normalizeLabel("", "Copy")).toBe("Copy");
  });

  test("keeps label when present", () => {
    expect(normalizeLabel("复制代码", "Copy")).toBe("复制代码");
  });
});

describe("writeClipboardText", () => {
  test("returns false when clipboard is missing", async () => {
    expect(await writeClipboardText("hi", null)).toBe(false);
  });

  test("writes text when clipboard is provided", async () => {
    let stored = "";
    const clipboard = {
      writeText: async (value: string) => {
        stored = value;
      },
    };
    expect(await writeClipboardText("hello", clipboard)).toBe(true);
    expect(stored).toBe("hello");
  });
});
