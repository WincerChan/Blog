import { describe, expect, test } from "bun:test";
import { formatUtc, parseDateLikeHugo } from "../tools/velite/time";

describe("parseDateLikeHugo", () => {
  test("parses ISO with Z timezone", () => {
    const parsed = parseDateLikeHugo("2024-01-02T03:04:05Z");
    expect(formatUtc(parsed)).toBe("2024-01-02T03:04:05Z");
  });

  test("parses date-only string with default timezone", () => {
    const parsed = parseDateLikeHugo("2024-01-02");
    expect(formatUtc(parsed)).toBe("2024-01-01T16:00:00Z");
  });

  test("normalizes space separated datetime and pads hour", () => {
    const parsed = parseDateLikeHugo("2024-01-02 3:04:05");
    expect(formatUtc(parsed)).toBe("2024-01-01T19:04:05Z");
  });

  test("returns invalid date for malformed input", () => {
    const parsed = parseDateLikeHugo("not-a-date");
    expect(Number.isFinite(parsed.getTime())).toBe(false);
  });
});
