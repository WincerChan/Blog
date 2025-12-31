import YAML from "yaml";
import { defineLoader } from "velite";

const MATTER_RE =
  /^---(?:\r?\n|\r)(?:([\s\S]*?)(?:\r?\n|\r))?---(?:\r?\n|\r|$)/;

const dedupeFrontmatterScalars = (frontmatter: string) => {
  const lines = frontmatter.split(/\r?\n/);
  const lastIndex = new Map<string, number>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = /^([A-Za-z0-9_-]+):\s*(.+)\s*$/.exec(line);
    if (!match) continue;
    lastIndex.set(match[1], i);
  }
  return lines
    .filter((line, i) => {
      const match = /^([A-Za-z0-9_-]+):\s*(.+)\s*$/.exec(line);
      if (!match) return true;
      return lastIndex.get(match[1]) === i;
    })
    .join("\n");
};

export const matterLoader = defineLoader({
  test: /\.(md|mdx)$/,
  load: async (file) => {
    const value = file.toString().trim();
    const match = value.match(MATTER_RE);
    const matter = match == null ? null : match[1];
    const cleaned = matter == null ? null : dedupeFrontmatterScalars(matter);
    const data = cleaned == null ? {} : YAML.parse(cleaned) ?? {};
    const content = match == null ? value : value.slice(match[0].length).trim();
    return { data, content };
  },
});

