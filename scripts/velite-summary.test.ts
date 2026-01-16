import { describe, expect, test } from "bun:test";
import { transforms } from "../tools/velite/markdown";

const { summaryFromMeta, plainFromMarkdown, countCjkAndLatin } = transforms;

describe("summaryFromMeta", () => {
  test("stops at <!-- more --> marker with spaces", () => {
    const meta = {
      mdast: {
        type: "root",
        children: [
          { type: "text", value: "Hello" },
          { type: "html", value: "<!-- more -->" },
          { type: "text", value: "World" },
        ],
      },
      plain: "Fallback",
    };
    expect(summaryFromMeta(meta, 200)).toBe("Hello");
  });

  test("falls back to plain when mdast is missing", () => {
    const meta = { plain: "Plain summary" };
    expect(summaryFromMeta(meta, 200)).toBe("Plain summary");
  });
});

describe("plainFromMarkdown", () => {
  test("strips markdown and keeps readable text", () => {
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
    expect(plainFromMarkdown(input)).toBe(
      "Title Hello world and code. Alt text Raw HTML Next line. const x = 1;",
    );
  });
});

describe("countCjkAndLatin", () => {
  test("counts cjk and latin separately", () => {
    const input = "你好 world 123 朋友";
    expect(countCjkAndLatin(input)).toEqual({ cjk: 4, latin: 2 });
  });
});
