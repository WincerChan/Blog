import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { emitPublicData } from "../tools/velite/emit/publicData";

const run = async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "velite-public-data-"));

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
  if ("hasLegacyComments" in postData) {
    throw new Error("post output should not include hasLegacyComments");
  }

  const pagePath = path.join(tempDir, "_data", "pages", "about.json");
  const pageData = JSON.parse(await fs.readFile(pagePath, "utf8"));
  if ("hasLegacyComments" in pageData) {
    throw new Error("page output should not include hasLegacyComments");
  }

  await fs.rm(tempDir, { recursive: true, force: true });
};

run()
  .then(() => {
    console.log("velite public data test passed");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
