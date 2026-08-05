#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/hash-admin-password.mjs "your-password"
 *   node scripts/hash-admin-password.mjs --generate
 */
import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node scripts/hash-admin-password.mjs "your-password"');
  console.error("       node scripts/hash-admin-password.mjs --generate");
  process.exit(1);
}

const password =
  arg === "--generate"
    ? randomBytes(18).toString("base64url")
    : arg;

const passwordHash = await hash(password, 12);
const pathToken = randomBytes(9)
  .toString("base64url")
  .replace(/[^a-zA-Z0-9]/g, "x");
const sessionSecret = randomBytes(48).toString("base64url");

console.log("\n# Paste into .env.local (keep secret!)\n");
console.log(`ADMIN_PATH=/admin-${pathToken}`);
console.log(`ADMIN_USERNAME=admin`);
console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`);
if (arg === "--generate") {
  console.log(`\n# Generated password (save now — not stored elsewhere):\n# ${password}\n`);
}
