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
      {
        slug: "math",
        title: "Math",
        date: "2024-01-02",
        updated: "2024-01-02",
        html: "<span class=\"katex\">x</span>",
      },
      {
        slug: "secret",
        title: "Secret",
        date: "2024-01-03",
        updated: "2024-01-03",
        html: "<p>secret</p>",
        private: true,
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
    expect(postData.hasMath ?? false).toBe(false);

    const mathPath = path.join(tempDir, "_data", "posts", "math.json");
    const mathData = JSON.parse(await fs.readFile(mathPath, "utf8"));
    expect(mathData.hasMath).toBe(true);

    const secretPath = path.join(tempDir, "_data", "posts", "secret.json");
    const secretData = JSON.parse(await fs.readFile(secretPath, "utf8"));
    expect(secretData.title).toBe("Secret");

    const pagePath = path.join(tempDir, "_data", "pages", "about.json");
    const pageData = JSON.parse(await fs.readFile(pagePath, "utf8"));
    expect("hasLegacyComments" in pageData).toBe(false);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
