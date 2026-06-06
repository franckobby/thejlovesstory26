/**
 * Dead-simple shared passcode for the /admin page — no sessions, tokens, or
 * cookies. Set ADMIN_PASSCODE (in .env.local and in Vercel) to change it.
 */
export function adminPasscode(): string {
  return process.env.ADMIN_PASSCODE || "lovejj2026";
}

export function checkPasscode(input: string | null | undefined): boolean {
  return !!input && input === adminPasscode();
}
