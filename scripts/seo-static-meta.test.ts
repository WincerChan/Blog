import { describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "..");

describe("static application meta", () => {
  test("ApplicationMeta is mounted at app root only", async () => {
    const appSource = await fs.readFile(
      path.join(repoRoot, "src/app.tsx"),
      "utf8",
    );
    const headSource = await fs.readFile(
      path.join(repoRoot, "src/site/seo/index.tsx"),
      "utf8",
    );

    expect(appSource).toContain("<ApplicationMeta />");
    expect(headSource).not.toContain("ApplicationMeta");
  });
});
