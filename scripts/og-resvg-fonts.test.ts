import { describe, expect, test } from "bun:test";
import { renderPng } from "../tools/velite/og/resvg";

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
});
