import fs from "node:fs/promises";
import path from "node:path";

export const writeFile = async (filepath: string, content: string) => {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, content, "utf8");
};

