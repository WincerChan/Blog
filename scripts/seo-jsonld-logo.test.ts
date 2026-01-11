import { describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "..");

describe("JSON-LD publisher logo", () => {
  test("uses the local favicon logo asset", async () => {
    const source = await fs.readFile(
      path.join(repoRoot, "src/site/seo/index.tsx"),
      "utf8",
    );

    expect(source).toContain("/favicon/generated/logo-512.png");
  });
});
