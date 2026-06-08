/**
 * Apply LaneOS migrations to a linked Supabase project.
 * Requires: npx supabase login (once), then run with DB password:
 *   SUPABASE_DB_PASSWORD=your-password node scripts/apply-migrations.mjs
 */
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const projectRef = "guugfijvliettsjtkcvv";
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error(
    "Set SUPABASE_DB_PASSWORD (from Supabase Dashboard → Database → Reset password)."
  );
  console.error(
    "Or paste both migration files into SQL Editor and click Run:"
  );
  for (const file of [
    "20250607000001_initial_schema.sql",
    "20250608000001_integrations_and_scanning.sql",
  ]) {
    console.error(`  supabase/migrations/${file}`);
  }
  process.exit(1);
}

const dbUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;

for (const file of [
  "20250607000001_initial_schema.sql",
  "20250608000001_integrations_and_scanning.sql",
]) {
  console.log(`Applying ${file}...`);
  execSync(`npx supabase db query --db-url "${dbUrl}" -f "${join(root, "supabase", "migrations", file)}"`, {
    cwd: root,
    stdio: "inherit",
  });
}

console.log("Migrations applied successfully.");
