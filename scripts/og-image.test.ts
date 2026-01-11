import { describe, expect, test } from "bun:test";
import { DEFAULT_OG_IMAGE, resolveOgImagePath } from "../src/site/seo/og";
import { OG_PNG_SCALE } from "../tools/velite/emit/ogImages";

describe("resolveOgImagePath", () => {
  test("ignores cover for post pages", () => {
    expect(resolveOgImagePath("/posts/hello/", "https://example.com/cover.png")).toBe(
      "/og/hello.png",
    );
  });

  test("builds og path for post pages", () => {
    expect(resolveOgImagePath("/posts/hello/", "")).toBe("/og/hello.png");
  });

  test("sanitizes slashes in slug", () => {
    expect(resolveOgImagePath("/posts/foo/bar/", "")).toBe("/og/foo_bar.png");
  });

  test("uses cover for non-post pages", () => {
    expect(resolveOgImagePath("/about/", "https://example.com/cover.png")).toBe(
      "https://example.com/cover.png",
    );
  });

  test("falls back for non-post pages without cover", () => {
    expect(resolveOgImagePath("/about/", "")).toBe(DEFAULT_OG_IMAGE);
  });

  test("uses 1x scale for og png generation", () => {
    expect(OG_PNG_SCALE).toBe(1.5);
  });
});
