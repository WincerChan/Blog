import { describe, expect, test } from "bun:test";
import { resolveOgImagePath } from "../src/site/seo/og";
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

  test("ignores cover for non-post pages", () => {
    expect(resolveOgImagePath("/about/", "https://example.com/cover.png")).toBe(
      "/og/page_about.png",
    );
  });

  test("builds og path for non-post pages", () => {
    expect(resolveOgImagePath("/about/", "")).toBe("/og/page_about.png");
  });

  test("builds og path for home page", () => {
    expect(resolveOgImagePath("/", "")).toBe("/og/page_index.png");
  });

  test("uses configured scale for og png generation", () => {
    expect(OG_PNG_SCALE).toBe(1.5);
  });
});
