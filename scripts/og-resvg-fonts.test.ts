import { describe, expect, test } from "bun:test";
import { renderPng } from "../tools/content/og/resvg";
import { renderAsync } from "@resvg/resvg-js";
import sharp from "sharp";

describe("renderPng", () => {
  test("renders png for svg without text", async () => {
    const svg =
      '<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="1200" height="630" fill="#ffffff"/>' +
      "</svg>";
    const png = await renderPng(svg, { scale: 1 });
    expect(Buffer.isBuffer(png)).toBe(true);
    expect(png.length).toBeGreaterThan(0);
  });

  test("PNG encoding preserves resvg pixels, transparency and requested size", async () => {
    const svg = '<svg width="120" height="63" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="3" y="5" width="80" height="40" fill="#1f6f6a" opacity="0.4"/>' +
      '<circle cx="65" cy="35" r="20" fill="#374151" opacity="0.75"/></svg>';
    const reference = await renderAsync(svg, {
      fitTo: { mode: 'width', value: 180 }, font: { loadSystemFonts: false },
    });
    const png = await renderPng(svg, { width: 120, scale: 1.5 });
    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect(info.width).toBe(reference.width);
    expect(info.height).toBe(reference.height);
    expect(data.equals(reference.pixels)).toBe(true);
  });
});
