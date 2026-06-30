/**
 * Usage:  node scripts/hash-password.mjs <your-new-password>
 *
 * Copy the output line into .env.local as ADMIN_PASSWORD=...
 * Then restart the dev server.
 */
import { randomBytes, scryptSync } from "crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const salt = randomBytes(32).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
console.log(`ADMIN_PASSWORD=scrypt:${salt}:${hash}`);
