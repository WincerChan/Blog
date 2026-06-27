import { describe, expect, test } from "bun:test";
import { formatDateTime } from "../src/utils";

describe("formatDateTime", () => {
  test("formats article updated time in Shanghai timezone", () => {
    expect(formatDateTime(new Date("2023-10-25T06:20:00.000Z"))).toBe(
      "2023-10-25 14:20:00",
    );
  });

  test("falls back to the original value for invalid input", () => {
    expect(formatDateTime("not-a-date")).toBe("not-a-date");
  });
});
