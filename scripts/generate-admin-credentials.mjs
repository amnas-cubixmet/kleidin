import { randomBytes, scryptSync } from "node:crypto";

const email = (process.env.KLEID_ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.KLEID_ADMIN_PASSWORD ?? "";

if (!email || !password) {
  console.error(
    [
      "Missing setup values.",
      "",
      "Set KLEID_ADMIN_EMAIL and KLEID_ADMIN_PASSWORD only for this command,",
      "then run: npm run admin:credentials",
      "",
      "The password itself is never written to the generated output.",
    ].join("\n"),
  );
  process.exit(1);
}

const salt = randomBytes(32).toString("hex");
const passwordHash = scryptSync(password, salt, 64).toString("hex");
const sessionSecret = randomBytes(48).toString("hex");

console.log("");
console.log("Copy these lines into .env.local (or your hosting environment):");
console.log("");
console.log(`ADMIN_EMAIL=${email}`);
console.log(`ADMIN_PASSWORD_SALT=${salt}`);
console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`);
console.log("");
console.log("Do not commit .env.local.");
