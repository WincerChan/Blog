const { createCipheriv, pbkdf2Sync, randomBytes, webcrypto } = require("node:crypto");
const { TextEncoder, TextDecoder } = require("node:util");

const ENCRYPTION_VERSION = "v1";
const PBKDF2_ITERATIONS = 120000;
const KEY_BYTES = 32;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const encryptHtml = (pwd, html) => {
  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);
  const key = pbkdf2Sync(String(pwd ?? ""), salt, PBKDF2_ITERATIONS, KEY_BYTES, "sha256");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(html, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENCRYPTION_VERSION}:${salt.toString("base64")}:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
};

const base64ToBytes = (value) => Uint8Array.from(Buffer.from(value, "base64"));

const concatBytes = (a, b) => {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
};

const decryptHtml = async (payload, password) => {
  const parts = String(payload ?? "").split(":");
  if (parts.length !== 5 || parts[0] !== ENCRYPTION_VERSION) {
    throw new Error("Invalid payload");
  }
  const [, saltB64, ivB64, tagB64, dataB64] = parts;
  const salt = base64ToBytes(saltB64);
  const iv = base64ToBytes(ivB64);
  const tag = base64ToBytes(tagB64);
  const data = base64ToBytes(dataB64);
  const combined = concatBytes(data, tag);

  if (!webcrypto?.subtle) throw new Error("WebCrypto unavailable");
  const encoder = new TextEncoder();
  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await webcrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_BYTES * 8 },
    false,
    ["decrypt"],
  );
  const decrypted = await webcrypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    combined,
  );
  return new TextDecoder().decode(decrypted);
};

(async () => {
  const payload = encryptHtml("test-pass", "<p>Hello</p>");
  const plain = await decryptHtml(payload, "test-pass");
  if (plain !== "<p>Hello</p>") {
    throw new Error("Decrypted content mismatch");
  }
  let failed = false;
  try {
    await decryptHtml(payload, "wrong-pass");
  } catch {
    failed = true;
  }
  if (!failed) {
    throw new Error("Expected decryption failure");
  }
  console.log("crypto-gcm.test.cjs: ok");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
