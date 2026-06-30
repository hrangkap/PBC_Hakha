import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const COOKIE_NAME = "admin_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ── Persistent in-memory storage (survives Next.js hot-reloads) ──────────────
declare global {
  // eslint-disable-next-line no-var
  var __adminSessions: Map<string, number> | undefined;
  // eslint-disable-next-line no-var
  var __adminFailedAttempts: Map<string, { count: number; resetAt: number }> | undefined;
}

const sessions      = global.__adminSessions      ?? (global.__adminSessions      = new Map<string, number>());
const failedAttempts= global.__adminFailedAttempts ?? (global.__adminFailedAttempts= new Map<string, { count: number; resetAt: number }>());
const MAX_ATTEMPTS   = 5;
const LOCKOUT_MS     = 15 * 60 * 1000; // 15 minutes

export function isRateLimited(ip: string): boolean {
  const now    = Date.now();
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (now > record.resetAt) { failedAttempts.delete(ip); return false; }
  return record.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(ip: string): void {
  const now    = Date.now();
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

// ── Session management ───────────────────────────────────────────────────────
export function createSession(): string {
  const token   = randomBytes(32).toString("hex"); // 64-char random hex
  const expiry  = Date.now() + COOKIE_MAX_AGE * 1000;
  sessions.set(token, expiry);
  return token;
}

export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const expiry = sessions.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) { sessions.delete(token); return false; }
  return true;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

// ── Password check ───────────────────────────────────────────────────────────
// Stored format: "scrypt:<salt_hex>:<hash_hex>"
export function checkPassword(input: string): boolean {
  const stored = process.env.ADMIN_PASSWORD ?? "";

  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const [, saltHex, storedHashHex] = parts;
    try {
      const inputHash   = scryptSync(input, saltHex, 64);
      const storedHash  = Buffer.from(storedHashHex, "hex");
      if (inputHash.length !== storedHash.length) return false;
      return timingSafeEqual(inputHash, storedHash);
    } catch {
      return false;
    }
  }

  // Fallback: plain-text comparison (timing-safe) for migration
  const correct = Buffer.from(stored);
  const attempt = Buffer.from(input);
  if (correct.length !== attempt.length) return false;
  return timingSafeEqual(correct, attempt);
}
