import { cookies } from "next/headers";
import { createHash } from "node:crypto";

export const ADMIN_COOKIE = "jj_admin";

/** Admin password — set ADMIN_PASSWORD in .env.local (falls back for local dev). */
function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "lovejj2026";
}

/** Opaque session token derived from the password (so the raw password is never stored). */
export function sessionToken(): string {
  return createHash("sha256").update(`jj::${adminPassword()}`).digest("hex");
}

export function checkPassword(input: string): boolean {
  return typeof input === "string" && input === adminPassword();
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === sessionToken();
}
