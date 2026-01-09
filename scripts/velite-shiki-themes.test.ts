import { describe, expect, test } from "bun:test";
import { shikiTheme, shikiThemeList } from "../tools/velite/shikiThemes";

describe("shikiThemes", () => {
  test("exports a single semantic theme", () => {
    expect(typeof shikiTheme).toBe("object");
    expect(shikiThemeList).toHaveLength(1);
  });

  test("uses css variables for base colors", () => {
    const theme = shikiTheme as { colors?: Record<string, string> };
    expect(theme.colors?.["editor.background"]).toBe("var(--code-bg)");
    expect(theme.colors?.["editor.foreground"]).toBe("var(--code-fg)");
  });

  test("token colors are mapped to code variables", () => {
    const theme = shikiTheme as { tokenColors?: Array<{ settings?: { foreground?: string } }> };
    const vars = (theme.tokenColors ?? [])
      .map((item) => item.settings?.foreground)
      .filter(Boolean) as string[];
    expect(vars.length).toBeGreaterThan(0);
    vars.forEach((value) => expect(value.startsWith("var(--code-")).toBe(true));
  });
});
