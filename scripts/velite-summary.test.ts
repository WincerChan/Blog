import { describe, expect, test } from "bun:test";
import { transforms } from "../tools/velite/markdown";

const { summaryFromMeta } = transforms;

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
