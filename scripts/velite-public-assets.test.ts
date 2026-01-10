import { describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { emitPublicAssets } from "../tools/velite/emit/publicAssets";

describe("emitPublicAssets", () => {
  test("writes manifest values from site config fields", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "velite-public-"));
    try {
      await emitPublicAssets({
        site: {
          baseURL: "https://example.com",
          title: "Example Blog",
          description: "Example description.",
          author: "Example",
          sitemap: { changeFreq: "weekly", priority: 0.6, termPriority: 0.3 },
        },
        publicDir: tmpDir,
      });

      const raw = await fs.readFile(
        path.join(tmpDir, "manifest.webmanifest"),
        "utf8",
      );
      const manifest = JSON.parse(raw);

      expect(manifest.name).toBe("Example Blog");
      expect(manifest.short_name).toBe("Example");
      expect(manifest.description).toBe("Example description.");
      expect(manifest.theme_color).toBe("#fdfdfc");
      expect(manifest.background_color).toBe("#fdfdfc");
      expect(manifest.icons).toEqual([
        {
          src: "/favicon/light.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
        {
          src: "/favicon/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
      ]);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
