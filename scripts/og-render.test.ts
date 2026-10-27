import { beforeAll, describe, expect, test } from "bun:test";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { loadOgFonts } from "../tools/content/og/fonts";
import { resolveSubtitleFontFamily, resolveTitleFontFamily, type OgRenderInput } from "../tools/content/og/targets";
import { clampByUnits } from "../tools/content/og/text";
import { createOgPngRenderer } from "../tools/content/og/takumi";
import { rendererDependencyFiles } from "../tools/build/rendererDependencies";

describe("Takumi OG rendering", () => {
  let render: Awaited<ReturnType<typeof createOgPngRenderer>>;
  const input: OgRenderInput = {
    title: "中文标题与 English 混排",
    subtitle: "保留字体、背景和清晰度",
    date: "2024-01-02",
    siteName: "Wincer.Blog",
    siteHost: "blog.itswincer.com",
    showDate: true,
    titleFontFamily: "LXGW WenKai, serif",
    subtitleFontFamily: "LXGW WenKai, serif",
  };
  beforeAll(async () => { render = await createOgPngRenderer(await loadOgFonts(process.cwd())); });

  test("renders native PNG at full resolution with both decorative SVG layers", async () => {
    const png = await render(input);
    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect(info.width).toBe(1800);
    expect(info.height).toBe(945);
    expect((await sharp(png).metadata()).format).toBe('png');
    // Broad interior regions detect missing SVG layers without pixel snapshots
    // or assumptions about font antialiasing at a particular library version.
    // stats() inspects its input, so materialize each crop first.
    const dot = await sharp(await sharp(png).extract({ left: 32, top: 38, width: 16, height: 16 }).toBuffer()).stats();
    const corner = await sharp(await sharp(png).extract({ left: 1700, top: 5, width: 50, height: 15 }).toBuffer()).stats();
    expect(dot.channels[0].min).toBeLessThan(248);
    expect(corner.channels[0].mean).toBeLessThan(240);
    for (let offset = 3; offset < data.length; offset += 4) {
      if (data[offset] !== 255) throw new Error('OG canvas must stay opaque');
    }
    const clipped = clampByUnits("a".repeat(200), 42);
    expect(clipped.endsWith("…")).toBe(true);
  });

  test("shared renderer keeps concurrent titles and date visibility independent", async () => {
    const [first, english, noDate, repeated] = await Promise.all([
      render(input),
      render({ ...input, title: "Solana Address Prefix Character Probability Analysis", titleFontFamily: "Fraunces, serif" }),
      render({ ...input, showDate: false }),
      render(input),
    ]);
    expect(first.equals(repeated)).toBe(true);
    const region = (png: Buffer, area: { left: number; top: number; width: number; height: number }) =>
      sharp(png).extract(area).raw().toBuffer();
    const titleArea = { left: 126, top: 250, width: 1300, height: 400 };
    const dateArea = { left: 1400, top: 110, width: 280, height: 90 };
    expect((await region(first, titleArea)).equals(await region(english, titleArea))).toBe(false);
    expect((await region(first, dateArea)).equals(await region(noDate, dateArea))).toBe(false);
    const hiddenDate = await sharp(await sharp(noDate).extract(dateArea).toBuffer()).stats();
    expect(hiddenDate.channels[0].min).toBeGreaterThan(200);
  });

  test("cache fingerprint includes Takumi helpers and the installed native package", async () => {
    const files = await rendererDependencyFiles(process.cwd(), ['@takumi-rs/core', '@takumi-rs/helpers']);
    const names = await Promise.all(files.filter(file => file.endsWith('/package.json'))
      .map(async file => JSON.parse(await readFile(file, 'utf8')).name));
    expect(names).toContain('@takumi-rs/core');
    expect(names).toContain('@takumi-rs/helpers');
    expect(names.some(name => name.startsWith('@takumi-rs/core-'))).toBe(true);
    expect(names).not.toContain('@takumi-rs/wasm');
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
