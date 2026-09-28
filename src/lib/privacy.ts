import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function encryptionKey() {
  const encoded = process.env.PII_ENCRYPTION_KEY;
  const key = encoded ? Buffer.from(encoded, "base64") : Buffer.alloc(0);

  if (key.length !== 32) {
    throw new Error("PII_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }

  return key;
}

function lookupKey() {
  const value = process.env.PII_LOOKUP_KEY;

  if (!value || value.length < 32) {
    throw new Error("PII_LOOKUP_KEY must contain at least 32 characters.");
  }

  return value;
}

export function encryptPersonalData(value: string) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]);
}

export function decryptPersonalData(value: Uint8Array) {
  const payload = Buffer.from(value);
  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function normalizedEmail(value: string) {
  return value.trim().toLowerCase();
}

export function personalDataLookupHash(value: string) {
  return createHmac("sha256", lookupKey()).update(value).digest();
}

export function generateCancellationToken() {
  return randomBytes(32).toString("base64url");
}

export function cancellationTokenHash(token: string) {
  return createHash("sha256").update(token).digest();
}
