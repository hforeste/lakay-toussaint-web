import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "node:crypto";
import { getConfig } from "./config";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function encryptionKey() {
  const encoded = getConfig("PII_ENCRYPTION_KEY");
  const key = encoded ? Buffer.from(encoded, "base64") : Buffer.alloc(0);
  if (key.length !== 32) throw new Error("PII_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  return key;
}

function lookupKey() {
  const value = getConfig("PII_LOOKUP_KEY");
  if (!value || value.length < 32) throw new Error("PII_LOOKUP_KEY must contain at least 32 characters.");
  return value;
}

export function encryptPersonalData(value: string) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
}

export function decryptPersonalData(value: Uint8Array | null) {
  if (!value) return "";
  const payload = Buffer.from(value);
  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), payload.subarray(0, IV_LENGTH));
  decipher.setAuthTag(payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH));
  return Buffer.concat([
    decipher.update(payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH)),
    decipher.final(),
  ]).toString("utf8");
}

export function normalizedEmail(value: string) {
  return value.trim().toLowerCase();
}

export function personalDataLookupHash(value: string) {
  return createHmac("sha256", lookupKey()).update(value).digest();
}

export function generateCancellationTokenHash() {
  return createHash("sha256").update(randomBytes(32)).digest();
}
