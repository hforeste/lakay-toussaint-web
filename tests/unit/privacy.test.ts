import { describe, expect, it } from "vitest";
import {
  cancellationTokenHash,
  decryptPersonalData,
  encryptPersonalData,
  generateCancellationToken,
  normalizedEmail,
  personalDataLookupHash,
} from "@/lib/privacy";

describe("registration privacy helpers", () => {
  it("encrypts and decrypts personal data without storing plaintext", () => {
    const encrypted = encryptPersonalData("Marie Toussaint");

    expect(Buffer.from(encrypted).toString("utf8")).not.toContain("Marie Toussaint");
    expect(decryptPersonalData(encrypted)).toBe("Marie Toussaint");
  });

  it("uses deterministic lookup hashes for normalized email", () => {
    const normalized = normalizedEmail("  MARIE@Example.com ");
    expect(normalized).toBe("marie@example.com");
    expect(personalDataLookupHash(normalized)).toEqual(personalDataLookupHash(normalized));
    expect(personalDataLookupHash(normalized)).not.toEqual(personalDataLookupHash("other@example.com"));
  });

  it("generates opaque cancellation tokens and deterministic hashes", () => {
    const token = generateCancellationToken();
    expect(token.length).toBeGreaterThan(30);
    expect(cancellationTokenHash(token)).toEqual(cancellationTokenHash(token));
    expect(cancellationTokenHash(token).toString("hex")).not.toContain(token);
  });

  it("rejects tampered encrypted payloads", () => {
    const encrypted = Buffer.from(encryptPersonalData("private"));
    encrypted[encrypted.length - 1] ^= 1;
    expect(() => decryptPersonalData(encrypted)).toThrow();
  });
});
