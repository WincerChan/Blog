import { describe, expect, test } from "bun:test";
import {
  canonicalPosts,
  computeNeighbours,
  computeRelated,
  visiblePages,
  visiblePosts,
} from "../tools/velite/shared";

const makePost = (slug: string, extras: Record<string, unknown> = {}) => ({
  slug,
  title: slug.toUpperCase(),
  date: "2024-01-01",
  ...extras,
});

describe("visibility helpers", () => {
  test("filters draft posts and keeps translations for visiblePosts", () => {
    const posts = [
      makePost("a"),
      makePost("b", { draft: true }),
      makePost("c", { isTranslation: true }),
    ];
    expect(visiblePosts(posts).map((p) => p.slug)).toEqual(["a", "c"]);
  });

  test("canonicalPosts excludes translations", () => {
    const posts = [
      makePost("a"),
      makePost("b", { isTranslation: true }),
    ];
    expect(canonicalPosts(posts).map((p) => p.slug)).toEqual(["a"]);
  });

  test("visiblePages filters drafts and sorts by weight", () => {
    const pages = [
      { slug: "a", weight: 10 },
      { slug: "b", weight: 2 },
      { slug: "c", draft: true, weight: 20 },
      { slug: "d" },
    ];
    expect(visiblePages(pages).map((p) => p.slug)).toEqual(["a", "b", "d"]);
  });
});

describe("computeNeighbours", () => {
  test("uses canon order for prev/next", () => {
    const canon = [makePost("new"), makePost("mid"), makePost("old")];
    const canonSlugSet = new Set(canon.map((p) => p.slug));
    const slugToPost = new Map(canon.map((p) => [p.slug, p]));
    const neighbours = computeNeighbours(canon[1], { canon, canonSlugSet, slugToPost });
    expect(neighbours.prev?.slug).toBe("/posts/old/");
    expect(neighbours.next?.slug).toBe("/posts/new/");
  });
});

describe("computeRelated", () => {
  test("scores by category and tags", () => {
    const current = makePost("current", { category: "cat", tags: ["t1", "t2"] });
    const p1 = makePost("p1", { category: "cat", tags: ["t1"] });
    const p2 = makePost("p2", { category: "", tags: ["t1"] });
    const p3 = makePost("p3", { category: "cat", tags: [] });
    const p4 = makePost("p4", { category: "other", tags: ["x"] });
    const canon = [current, p1, p2, p3, p4];
    const related = computeRelated(current, canon);
    expect(related.map((r) => r.slug)).toEqual([
      "/posts/p1/",
      "/posts/p2/",
      "/posts/p3/",
    ]);
  });
});
