import { createHash, scryptSync, timingSafeEqual } from "crypto";

export const COOKIE_NAME = "admin_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ── Rate limiting (best-effort in-memory) ────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __adminFailedAttempts: Map<string, { count: number; resetAt: number }> | undefined;
}

const failedAttempts = global.__adminFailedAttempts ?? (global.__adminFailedAttempts = new Map());
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (now > record.resetAt) { failedAttempts.delete(ip); return false; }
  return record.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record || now > record.resetAt) {
    failedAttempts.set(ip, { count: 1, resetAt: now + LOCKOUT_MS });
  } else {
    record.count += 1;
  }
}

export function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}

// ── Deterministic stateless session ─────────────────────────────────────────
// Session token = SHA-256("pbchk-session:" + AUTH_SECRET + ":" + ADMIN_PASSWORD).
// Deterministic across every Vercel serverless instance — no shared state needed.
// Changing ADMIN_PASSWORD automatically invalidates all existing sessions.

function expectedToken(): string {
  const secret = process.env.AUTH_SECRET ?? "pbchakha_fallback_secret";
  const pass = process.env.ADMIN_PASSWORD ?? "";
  return createHash("sha256")
    .update("pbchk-session:" + secret + ":" + pass)
    .digest("hex");
}

export function createSession(): string {
  return expectedToken();
}

export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const expected = expectedToken();
  try {
    return timingSafeEqual(
      Buffer.from(token.slice(0, 64), "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}

// Logout clears the cookie; there's nothing server-side to revoke.
export function destroySession(_token: string): void {}

// ── Password check ───────────────────────────────────────────────────────────
export function checkPassword(input: string): boolean {
  const stored = process.env.ADMIN_PASSWORD ?? "";

  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const [, saltHex, storedHashHex] = parts;
    try {
      const inputHash = scryptSync(input, saltHex, 64);
      const storedHash = Buffer.from(storedHashHex, "hex");
      if (inputHash.length !== storedHash.length) return false;
      return timingSafeEqual(inputHash, storedHash);
    } catch {
      return false;
    }
  }

  // Fallback: plain-text (also handles plain ADMIN_PASSWORD on Vercel)
  const correct = Buffer.from(stored);
  const attempt = Buffer.from(input);
  if (correct.length !== attempt.length) return false;
  return timingSafeEqual(correct, attempt);
}
