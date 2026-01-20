import { expect, test } from "bun:test";
import trackPkg from "../packages/inkstone-track/package.json";

test("inkstone-track package exports built artifacts", () => {
  const exportsField = (trackPkg as { exports?: Record<string, unknown> }).exports ?? {};
  const rootExport = exportsField["."] as { types?: string; default?: string } | undefined;
  expect(trackPkg.name).toBe("@wincer/inkstone-track");
  expect(rootExport?.types).toBe("./dist/index.d.ts");
  expect(rootExport?.default).toBe("./dist/index.js");
  expect(trackPkg.files).toContain("dist");
  expect(trackPkg.publishConfig?.access).toBe("public");
});
