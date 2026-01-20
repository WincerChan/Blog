import fs from "node:fs/promises";
import path from "node:path";
import { expect, test } from "bun:test";

const ROOT = process.cwd();
const ICONS_DIR = path.join(ROOT, "packages", "icons");

const assertFileExists = async (relativePath: string) => {
  const fullPath = path.join(ICONS_DIR, relativePath);
  const stat = await fs.stat(fullPath);
  expect(stat.isFile()).toBe(true);
  expect(stat.size).toBeGreaterThan(0);
};

test("inkstone icons package includes svg and png assets", async () => {
  await assertFileExists(path.join("icons", "light.svg"));
  await assertFileExists(path.join("icons", "dark.svg"));
  await assertFileExists(path.join("icons", "safari-pinned-tab.svg"));
  await assertFileExists(path.join("raster", "apple-touch-icon.png"));
  await assertFileExists(path.join("raster", "logo-512.png"));
});
