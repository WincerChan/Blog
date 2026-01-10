import { describe, expect, test } from "bun:test";
import { loadOgFonts } from "../tools/velite/og/fonts";
import { resolveSubtitleFontFamily, resolveTitleFontFamily } from "../tools/velite/emit/ogImages";
import { clampByUnits, renderOgSvg } from "../tools/velite/og/template";

describe("renderOgSvg", () => {
  test("renders svg without layout errors", async () => {
    const fonts = await loadOgFonts(process.cwd());
    const svg = await renderOgSvg({
      title: "OG Render Smoke Test",
      subtitle: "a".repeat(200),
      date: "2024-01-02",
      siteName: "Wincer.Blog",
      siteHost: "blog.itswincer.com",
      showDate: true,
      fonts,
    });
    expect(svg.startsWith("<svg")).toBe(true);
    const dotMatches = svg.match(/rotate\(45/g) ?? [];
    expect(dotMatches.length).toBeGreaterThan(100);
    const clipped = clampByUnits("a".repeat(200), 42);
    expect(clipped.endsWith("…")).toBe(true);
  });

  test("chooses title font based on lang and content", () => {
    expect(resolveTitleFontFamily({ lang: "zh-CN" }, "中文123")).toContain("LXGW WenKai");
    expect(resolveTitleFontFamily({ lang: "en" }, "Pure English 2024")).toContain("Fraunces");
    expect(resolveTitleFontFamily({ lang: "en" }, "混合 English")).toContain("LXGW WenKai");
  });

  test("chooses subtitle font based on lang and content", () => {
    expect(resolveSubtitleFontFamily({ lang: "zh-CN" }, "副标题")).toContain("LXGW WenKai");
    expect(resolveSubtitleFontFamily({ lang: "en" }, "English subtitle")).toContain(
      "IBM Plex Sans"
    );
    expect(resolveSubtitleFontFamily({ lang: "en" }, "混合 subtitle")).toContain("LXGW WenKai");
  });
});
