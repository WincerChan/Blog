import { describe, expect, test } from "bun:test";
import {
  buildCommentsMapping,
  formatCommentsMappingFetchError,
  normalizeCommentPath,
} from "../tools/velite/commentsMapping";

describe("normalizeCommentPath", () => {
  test("normalizes paths and strips query/hash", () => {
    expect(normalizeCommentPath("posts/Hello")).toBe("/posts/hello/");
    expect(normalizeCommentPath("/posts/hello")).toBe("/posts/hello/");
    expect(normalizeCommentPath("https://example.com/posts/hello?x=1#y")).toBe(
      "/posts/hello/",
    );
  });
});

describe("buildCommentsMapping", () => {
  test("filters invalid entries and normalizes keys", () => {
    const map = buildCommentsMapping([
      { post_id: "/posts/hello", discussion_url: "https://github.com/x/1" },
      { post_id: "", discussion_url: "https://github.com/x/2" },
      { post_id: "/posts/skip", discussion_url: "" },
    ]);
    expect(map.size).toBe(1);
    expect(map.get("/posts/hello/")).toBe("https://github.com/x/1");
  });
});

describe("formatCommentsMappingFetchError", () => {
  test("expands timeout errors with actionable detail", () => {
    const error = Object.assign(new Error("The operation was aborted."), {
      name: "AbortError",
    });
    const message = formatCommentsMappingFetchError({
      error,
      url: "http://localhost:8080/v2/comments/mapping?inkstone_token=test",
      timeoutMs: 5000,
    });
    expect(message).toContain("timed out after 5000ms");
    expect(message).toContain("http://localhost:8080/v2/comments/mapping");
    expect(message).toContain("Local Inkstone API may be unavailable");
    expect(message).not.toContain("inkstone_token");
    expect(message).not.toContain("test");
  });
});
