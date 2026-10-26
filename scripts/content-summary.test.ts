import { describe, expect, test } from "bun:test";
import { transforms } from "../tools/content/metadata";
const { plainFromMarkdown } = transforms;

describe("plainFromMarkdown", () => {
  test("strips markdown and keeps readable text", async () => {
    const input = [
      "# Title",
      "",
      "Hello **world** and `code`.",
      "",
      "![Alt text](https://example.com/img.png)",
      "",
      "<span>Raw <b>HTML</b></span>",
      "",
      "<!-- more -->",
      "",
      "Next line.",
      "",
      "```js",
      "const x = 1;",
      "```",
    ].join("\n");
    expect(await plainFromMarkdown(input)).toBe(
      "Title Hello world and code. Alt text Raw HTML Next line. const x = 1;",
    );
  });

  test("removes emphasis markers", async () => {
    expect(await plainFromMarkdown("**bold** _italic_")).toBe("bold italic");
  });
});
