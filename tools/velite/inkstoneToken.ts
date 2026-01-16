import { createHmac } from "node:crypto";

const toBase64Url = (value: Buffer | string) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const buildInkstoneToken = (pathValue: string, secret: string) => {
  const payload = JSON.stringify({ path: pathValue });
  const payloadB64 = toBase64Url(payload);
  const signature = createHmac("sha256", secret).update(payloadB64).digest();
  return `${payloadB64}.${toBase64Url(signature)}`;
};

export { buildInkstoneToken };
