import { createHmac, scryptSync, timingSafeEqual } from "crypto";

export const COOKIE_NAME = "admin_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ── Rate limiting (in-memory, best-effort) ───────────────────────────────────
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

// ── Stateless HMAC session ───────────────────────────────────────────────────
// Token format: "<expiry_ms>.<hmac_hex>"
// Works across multiple Vercel serverless instances (no shared memory needed).

function secret(): string {
  return process.env.AUTH_SECRET ?? "pbchakha_fallback_secret";
}

export function createSession(): string {
  const expiry = String(Date.now() + COOKIE_MAX_AGE * 1000);
  const sig = createHmac("sha256", secret()).update(expiry).digest("hex");
  return `${expiry}.${sig}`;
}

export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return false;
  } catch {
    return false;
  }
  return Date.now() < parseInt(payload, 10);
}

// No-op — stateless tokens can't be server-side revoked; logout clears the cookie.
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

  // Fallback: plain-text comparison
  const correct = Buffer.from(stored);
  const attempt = Buffer.from(input);
  if (correct.length !== attempt.length) return false;
  return timingSafeEqual(correct, attempt);
}
