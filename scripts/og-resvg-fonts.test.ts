import { describe, expect, test } from "bun:test";
import { resolveResvgFontFiles } from "../tools/velite/og/resvg";

describe("resolveResvgFontFiles", () => {
  test("returns existing font file paths", () => {
    const fonts = resolveResvgFontFiles(process.cwd());
    expect(Array.isArray(fonts)).toBe(true);
    expect(fonts.length).toBeGreaterThan(0);
    fonts.forEach((file) => {
      expect(typeof file).toBe("string");
    });
  });
});
