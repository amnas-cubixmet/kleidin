import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equals = trimmed.indexOf("=");
    if (equals === -1) continue;

    const key = trimmed.slice(0, equals).trim();
    let value = trimmed.slice(equals + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function normalizeDatabaseUrl(value) {
  try {
    return new URL(value).toString();
  } catch {
    throw new Error("POSTGRES_URL_NON_POOLING / POSTGRES_URL is not a valid PostgreSQL URL.");
  }
}

const cwd = process.cwd();

loadEnvFile(path.join(cwd, ".env.local"));
loadEnvFile(path.join(cwd, ".env"));

const rawDatabaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!rawDatabaseUrl) {
  console.error("\nMissing PostgreSQL connection URL.");
  console.error(
    "Add POSTGRES_URL_NON_POOLING to .env.local, then run npm run db:schema again.\n",
  );
  process.exit(1);
}

const migrationDir = path.join(cwd, "supabase", "migrations");
const migrationPath = path.join(
  migrationDir,
  "20261004000100_kleidin_initial_schema.sql",
);

if (!fs.existsSync(migrationPath)) {
  console.error("\nMissing migration file:");
  console.error(migrationPath);
  console.error("\nPull the latest main branch and try again.\n");
  process.exit(1);
}

const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

console.log("\nKLEID.IN database schema");
console.log("Target:", new URL(databaseUrl).hostname);
console.log("Applying pending Supabase migrations...\n");

const result = spawnSync(
  npx,
  [
    "--yes",
    "supabase@latest",
    "db",
    "push",
    "--db-url",
    databaseUrl,
    "--include-all",
  ],
  {
    cwd,
    stdio: "inherit",
    env: process.env,
  },
);

if (result.error) {
  console.error("\nCould not start Supabase CLI.");
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  console.error("\nSchema push failed.");
  process.exit(result.status ?? 1);
}

console.log("\nSchema applied successfully.");
console.log("You can now restart Next.js with: npm run dev\n");
