import { describe, expect, test } from "bun:test";
import {
  formatWarningLog,
  isLocalPreview,
  resolveInkstoneTokenSecret,
} from "../tools/velite/prepare";

describe("isLocalPreview", () => {
  test("returns true only for development", () => {
    expect(isLocalPreview({ NODE_ENV: "development" })).toBe(true);
    expect(isLocalPreview({ NODE_ENV: "production" })).toBe(false);
    expect(isLocalPreview({})).toBe(false);
  });
});

describe("resolveInkstoneTokenSecret", () => {
  test("uses explicit secret when provided", () => {
    expect(
      resolveInkstoneTokenSecret({
        NODE_ENV: "development",
        INKSTONE_PUBLIC_TOKEN_SECRET: "real-secret",
      }),
    ).toEqual({
      tokenSecret: "real-secret",
      hasExplicitSecret: true,
    });
  });

  test("falls back to local preview placeholder only in development", () => {
    expect(
      resolveInkstoneTokenSecret({
        NODE_ENV: "development",
      }),
    ).toEqual({
      tokenSecret: "__local_preview__",
      hasExplicitSecret: false,
    });

    expect(
      resolveInkstoneTokenSecret({
        NODE_ENV: "production",
      }),
    ).toEqual({
      tokenSecret: "",
      hasExplicitSecret: false,
    });
  });
});

describe("formatWarningLog", () => {
  test("adds a highlighted warning badge", () => {
    const message = formatWarningLog("[velite] demo warning");
    expect(message).toContain("\x1b[30;43m WARN \x1b[0m");
    expect(message).toContain("\x1b[1;33m[velite] demo warning\x1b[0m");
  });
});
