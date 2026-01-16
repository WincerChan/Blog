import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { expect, test } from "bun:test";
import { emitSearchIndex } from "../tools/velite/emit/searchIndex";

test("emitSearchIndex outputs per-field cjk/latin counts", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "velite-search-index-"));
  try {
    const posts = [
      {
        slug: "demo",
        title: "Hello **世界**",
        subtitle: "_副题_",
        date: "2024-01-01",
        updated: "2024-01-02",
        rawContent: "Content **世界** 123",
        category: "分享",
        tags: ["tag-a"],
      },
    ];

    await emitSearchIndex({ publicDir: tempDir, posts });

    const outputPath = path.join(tempDir, "search-index.json");
    const data = JSON.parse(await fs.readFile(outputPath, "utf8"));
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);

    const item = data[0];
    expect(item.title).toBe("Hello 世界");
    expect(item.subtitle).toBe("副题");
    expect(item.content).toBe("Content 世界 123");

    expect(item.title_cjk).toBe("世界");
    expect(item.title_latin).toBe("Hello");
    expect(item.subtitle_cjk).toBe("副题");
    expect(item.subtitle_latin).toBe("");
    expect(item.content_cjk).toBe("世界");
    expect(item.content_latin).toBe("Content 123");
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
