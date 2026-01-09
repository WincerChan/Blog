import { describe, expect, test } from "bun:test";
import { canAppendToken, findToken, normalizeQuery } from "../src/features/pages/searchQuery";

const normalize = (input: string) => normalizeQuery(input);

describe("normalizeQuery", () => {
  test("trims and normalizes tokens", () => {
    expect(normalize("")).toBe("");
    expect(normalize("  hello  ")).toBe("hello");
    expect(normalize("tag:rust")).toBe("tags:rust");
    expect(normalize("tags:rust,solid tag:solid")).toBe("tags:rust,solid");
    expect(normalize("tag:a tag:b tag:c tag:d")).toBe("tags:a,b,c");
    expect(normalize("hello tag:rust tag:solid")).toBe("hello tags:rust,solid");
  });
});

describe("findToken", () => {
  test("locates category token range", () => {
    expect(findToken("foo category:bar baz", "category:")).toEqual({
      valueStart: 13,
      valueEnd: 16,
    });
  });
});

describe("canAppendToken", () => {
  test("enforces tag and category limits", () => {
    expect(canAppendToken("tag:a tag:b tag:c", "tag:")).toBe(false);
    expect(canAppendToken("tag:a tag:b", "tag:")).toBe(true);
    expect(canAppendToken("category:foo", "category:")).toBe(false);
  });
});
