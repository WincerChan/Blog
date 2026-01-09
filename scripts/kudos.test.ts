import { describe, expect, test } from "bun:test";
import { normalizeKudosPath } from "../src/features/article/sidebar/social/kudos";

describe("normalizeKudosPath", () => {
  test("strips -zh suffix", () => {
    expect(normalizeKudosPath("/posts/hello-zh/")).toBe("/posts/hello/");
  });

  test("strips -en suffix", () => {
    expect(normalizeKudosPath("/posts/hello-en/")).toBe("/posts/hello/");
  });

  test("returns empty string for empty input", () => {
    expect(normalizeKudosPath("")).toBe("");
  });
});
