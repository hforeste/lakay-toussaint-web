import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getConfig } from "./config";

export const ADMIN_COOKIE = "ltca_admin_session";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function sessionToken() {
  const password = getConfig("ADMIN_PASSWORD");
  if (!password) throw new Error("ADMIN_PASSWORD is not configured for the admin application.");
  return digest(`ltca-admin-session:${password}`).toString("hex");
}

export function passwordMatches(candidate: string) {
  const expected = getConfig("ADMIN_PASSWORD");
  if (!expected) return false;
  return timingSafeEqual(digest(candidate), digest(expected));
}

export async function isAuthenticated() {
  const supplied = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!supplied) return false;

  const expected = sessionToken();
  return supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}
