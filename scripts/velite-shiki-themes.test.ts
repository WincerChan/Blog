import { describe, expect, test } from "bun:test";
import { shikiThemeList, shikiThemes } from "../tools/velite/shikiThemes";

describe("shikiThemes", () => {
  test("uses the vitesse theme pair", () => {
    expect(typeof shikiThemes.light).toBe("object");
    expect(typeof shikiThemes.dark).toBe("object");
    expect(shikiThemeList).toHaveLength(2);
  });

  test("uses css variables for base colors", () => {
    const lightTheme = shikiThemes.light as { colors?: Record<string, string> };
    expect(lightTheme.colors?.["editor.background"]).toBe("var(--code-bg)");
    expect(lightTheme.colors?.["editor.foreground"]).toBe("var(--code-fg)");
  });

  test("token colors are mapped to code variables", () => {
    const lightTheme = shikiThemes.light as { tokenColors?: Array<{ settings?: { foreground?: string } }> };
    const vars = (lightTheme.tokenColors ?? [])
      .map((item) => item.settings?.foreground)
      .filter(Boolean) as string[];
    expect(vars.length).toBeGreaterThan(0);
    vars.forEach((value) => expect(value.startsWith("var(--code-")).toBe(true));
  });
});
