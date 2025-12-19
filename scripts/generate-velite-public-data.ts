import fs from "node:fs/promises";
import path from "node:path";
import { emitPublicData } from "../tools/velite/emit/publicData";

const repoRoot = process.cwd();
const veliteDir = path.join(repoRoot, ".velite");

const readJson = async (filepath: string) => JSON.parse(await fs.readFile(filepath, "utf8"));

const main = async () => {
  const postsPath = path.join(veliteDir, "posts.json");
  const pagesPath = path.join(veliteDir, "pages.json");
  const friendsPath = path.join(veliteDir, "friends.json");

  const [posts, pages, friends] = await Promise.all([
    readJson(postsPath),
    readJson(pagesPath),
    readJson(friendsPath),
  ]);

  await emitPublicData({
    publicDir: path.join(repoRoot, "public"),
    posts,
    pages,
    friends,
  });
};

await main();
