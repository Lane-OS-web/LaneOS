import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, "apps/web/.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase env vars in apps/web/.env.local");
  process.exit(1);
}

const health = await fetch(`${url}/auth/v1/health`, {
  headers: { apikey: key },
});
console.log("auth health:", health.status);

const orgs = await fetch(`${url}/rest/v1/organizations?select=id&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const orgBody = await orgs.text();
console.log("organizations table:", orgs.status, orgBody.slice(0, 120));
