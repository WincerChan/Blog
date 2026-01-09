import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { expect, test } from "bun:test";
import { emitPublicData } from "../tools/velite/emit/publicData";

test("emitPublicData omits legacy comments markers", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "velite-public-data-"));
  try {
    const posts = [
      {
        slug: "demo",
        title: "Demo",
        date: "2024-01-01",
        updated: "2024-01-02",
        html: "<p>hello</p>",
      },
    ];
    const pages = [
      {
        slug: "about",
        title: "About",
        date: "2024-01-01",
        updated: "2024-01-01",
        html: "<p>about</p>",
      },
    ];

    await emitPublicData({ publicDir: tempDir, posts, pages, friends: [] });

    const postPath = path.join(tempDir, "_data", "posts", "demo.json");
    const postData = JSON.parse(await fs.readFile(postPath, "utf8"));
    expect("hasLegacyComments" in postData).toBe(false);

    const pagePath = path.join(tempDir, "_data", "pages", "about.json");
    const pageData = JSON.parse(await fs.readFile(pagePath, "utf8"));
    expect("hasLegacyComments" in pageData).toBe(false);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
