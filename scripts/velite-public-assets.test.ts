import { describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { emitPublicAssets } from "../tools/velite/emit/publicAssets";

const readPngSize = async (filePath: string) => {
  const buffer = await fs.readFile(filePath);
  if (buffer.length < 24) {
    throw new Error("Invalid PNG header");
  }
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("Invalid PNG signature");
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
};

describe("emitPublicAssets", () => {
  test("writes manifest values from site config fields", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "velite-public-"));
    try {
      await fs.mkdir(path.join(tmpDir, "favicon"), { recursive: true });
      await fs.writeFile(
        path.join(tmpDir, "favicon", "light.svg"),
        `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#000"/></svg>`,
        "utf8",
      );
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
          src: "/favicon/generated/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/favicon/generated/logo-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ]);

      const applePath = path.join(
        tmpDir,
        "favicon",
        "generated",
        "apple-touch-icon.png",
      );
      const logoPath = path.join(
        tmpDir,
        "favicon",
        "generated",
        "logo-512.png",
      );

      await fs.access(applePath);
      await fs.access(logoPath);
      await fs.access(path.join(tmpDir, "favicon.ico"));

      const appleSize = await readPngSize(applePath);
      const logoSize = await readPngSize(logoPath);
      expect(appleSize).toEqual({ width: 180, height: 180 });
      expect(logoSize).toEqual({ width: 512, height: 512 });
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
