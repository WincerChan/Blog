import { createHmac } from "node:crypto";
import { expect, test } from "bun:test";
import { buildInkstoneToken } from "../tools/velite/inkstoneToken";

const toBase64Url = (value: Buffer | string) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const normalized = pad ? padded + "=".repeat(4 - pad) : padded;
  return Buffer.from(normalized, "base64").toString("utf8");
};

const expectedToken = (pathValue: string, secret: string) => {
  const payload = JSON.stringify({ path: pathValue });
  const payloadB64 = toBase64Url(payload);
  const signature = createHmac("sha256", secret).update(payloadB64).digest();
  return `${payloadB64}.${toBase64Url(signature)}`;
};

const assertToken = (pathValue: string, secret: string) => {
  const token = buildInkstoneToken(pathValue, secret);
  const [payloadB64] = token.split(".");
  expect(token).toBe(expectedToken(pathValue, secret));
  expect(payloadB64).toBeDefined();
  expect(payloadB64).not.toMatch(/[+/=]/);
  const payload = JSON.parse(fromBase64Url(payloadB64));
  expect(payload).toEqual({ path: pathValue });
};

test("buildInkstoneToken signs category paths", () => {
  const secret = "test-secret";
  assertToken("/category/%E7%A2%8E%E7%A2%8E%E5%BF%B5/", secret);
  assertToken("/category/solana/", secret);
});
