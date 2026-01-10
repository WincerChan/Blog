import { describe, expect, test } from "bun:test";
import { hasTranslationMeta } from "../src/features/article/utils/translation";
import type { ArticleMeta } from "../src/features/article/types";

describe("hasTranslationMeta", () => {
  test("returns true when lang exists and isTranslation is present", () => {
    const blog = { lang: "zh-CN", isTranslation: false } as ArticleMeta;
    expect(hasTranslationMeta(blog)).toBe(true);
  });

  test("returns false when lang is missing", () => {
    const blog = { isTranslation: true } as ArticleMeta;
    expect(hasTranslationMeta(blog)).toBe(false);
  });

  test("returns false when isTranslation is missing", () => {
    const blog = { lang: "en" } as ArticleMeta;
    expect(hasTranslationMeta(blog)).toBe(false);
  });
});
