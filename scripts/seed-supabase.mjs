/**
 * Seed LaneOS demo fleet data into Supabase.
 * Requires SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const DEMO_EMAIL = "owner@laneos.app";
const DEMO_PASSWORD = "LaneOSDemo2026!";

const brokers = [
  { id: "22222222-2222-4222-8222-222222222201", name: "Summit Logistics", mc_number: "MC-882104", contact_name: "Sarah Chen", contact_email: "loads@summitlogistics.com", payment_terms: 30, total_loads: 24, avg_days_to_pay: 28 },
  { id: "22222222-2222-4222-8222-222222222202", name: "Heartland Freight", mc_number: "MC-441902", contact_name: "Mike Torres", contact_email: "dispatch@heartlandfreight.com", payment_terms: 45, total_loads: 18, avg_days_to_pay: 41 },
  { id: "22222222-2222-4222-8222-222222222203", name: "Atlas Brokerage", mc_number: "MC-229018", contact_name: "Jen Park", contact_email: "jen@atlasbrokerage.com", payment_terms: 21, total_loads: 31, avg_days_to_pay: 19 },
];

const drivers = [
  { id: "33333333-3333-4333-8333-333333333301", first_name: "Marcus", last_name: "Johnson", phone: "(214) 555-0182", cdl_number: "TX-4829103", cdl_expiry: "2027-08-15", status: "active" },
  { id: "33333333-3333-4333-8333-333333333302", first_name: "Elena", last_name: "Ruiz", phone: "(469) 555-0294", cdl_number: "TX-3392014", cdl_expiry: "2026-11-20", status: "active" },
  { id: "33333333-3333-4333-8333-333333333303", first_name: "James", last_name: "Whitfield", phone: "(972) 555-0371", cdl_number: "TX-7712048", cdl_expiry: "2028-03-10", status: "active" },
];

const trucks = [
  { id: "44444444-4444-4444-8444-444444444401", unit_number: "101", make: "Freightliner", model: "Cascadia", year: 2022, trailer_type: "Dry Van", vin: "1FUJGHDV8NLBT4829", status: "active" },
  { id: "44444444-4444-4444-8444-444444444402", unit_number: "102", make: "Kenworth", model: "T680", year: 2021, trailer_type: "Reefer", vin: "1XKYD49X2MJ339201", status: "active" },
  { id: "44444444-4444-4444-8444-444444444403", unit_number: "103", make: "Volvo", model: "VNL 760", year: 2023, trailer_type: "Dry Van", vin: "4V4NC9EH9PN771204", status: "maintenance" },
];

const facilities = [
  { id: "55555555-5555-4555-8555-555555555501", name: "Dallas Distribution Center", facility_type: "shipper", address_line1: "1200 Commerce St", city: "Dallas", state: "TX", zip: "75201", dock_hours: "6am–6pm", avg_wait_minutes: 45, appointment_required: true },
  { id: "55555555-5555-4555-8555-555555555502", name: "Atlanta Cold Storage", facility_type: "receiver", address_line1: "400 Peachtree St", city: "Atlanta", state: "GA", zip: "30303", dock_hours: "24/7", avg_wait_minutes: 90, appointment_required: false },
  { id: "55555555-5555-4555-8555-555555555503", name: "Memphis Crossdock", facility_type: "shipper", address_line1: "800 Union Ave", city: "Memphis", state: "TN", zip: "38103", dock_hours: "7am–5pm", avg_wait_minutes: 60, appointment_required: true },
];

const loads = [
  { id: "66666666-6666-4666-8666-666666666601", load_number: "LP-2401", status: "in_transit", rate: 2850, commodity: "General freight", miles: 780, pickup_date: "2026-06-07", delivery_date: "2026-06-09", broker_id: brokers[0].id, driver_id: drivers[0].id, truck_id: trucks[0].id, reference_number: "SUM-88201", weight_lbs: 42000, notes: "Driver assigned. ETA delivery Jun 9.", created_at: "2026-06-06T14:00:00Z" },
  { id: "66666666-6666-4666-8666-666666666602", load_number: "LP-2402", status: "dispatched", rate: 1940, commodity: "Paper products", miles: 510, pickup_date: "2026-06-08", delivery_date: "2026-06-09", broker_id: brokers[1].id, driver_id: drivers[1].id, truck_id: trucks[1].id, reference_number: "HL-44102", weight_lbs: 38000, created_at: "2026-06-07T09:30:00Z" },
  { id: "66666666-6666-4666-8666-666666666603", load_number: "LP-2403", status: "booked", rate: 3200, commodity: "Retail goods", miles: 920, pickup_date: "2026-06-09", delivery_date: "2026-06-11", broker_id: brokers[2].id, reference_number: "ATL-22901", weight_lbs: 44000, notes: "Awaiting driver assignment", created_at: "2026-06-08T11:00:00Z" },
  { id: "66666666-6666-4666-8666-666666666604", load_number: "LP-2398", status: "delivered", rate: 2100, commodity: "Building materials", miles: 340, pickup_date: "2026-06-05", delivery_date: "2026-06-06", broker_id: brokers[0].id, driver_id: drivers[2].id, truck_id: trucks[2].id, reference_number: "SUM-88198", weight_lbs: 45000, created_at: "2026-06-04T16:00:00Z" },
  { id: "66666666-6666-4666-8666-666666666605", load_number: "LP-2405", status: "available", rate: 2650, commodity: "Automotive parts", miles: 640, pickup_date: "2026-06-10", delivery_date: "2026-06-11", broker_id: brokers[1].id, reference_number: "HL-44105", weight_lbs: 36000, notes: "AI parsed from email — ready to book", created_at: "2026-06-08T08:00:00Z" },
  { id: "66666666-6666-4666-8666-666666666606", load_number: "LP-2406", status: "available", rate: 1780, commodity: "Food grade", miles: 420, pickup_date: "2026-06-11", delivery_date: "2026-06-12", broker_id: brokers[2].id, reference_number: "ATL-22906", weight_lbs: 40000, notes: "Rate con uploaded — pending review", created_at: "2026-06-08T10:15:00Z" },
];

const documents = [
  { id: "77777777-7777-4777-8777-777777777701", load_id: loads[0].id, file_name: "LP-2401_rate_con.pdf", document_type: "rate_confirmation", storage_path: `${ORG_ID}/LP-2401_rate_con.pdf`, scan_status: "completed", scan_confidence: 0.94, parsed_data: { load_number: "LP-2401", broker_name: "Summit Logistics", rate: 2850, pickup_date: "2026-06-07", confidence: 0.94 }, created_at: "2026-06-06T12:00:00Z" },
  { id: "77777777-7777-4777-8777-777777777702", load_id: loads[0].id, file_name: "LP-2401_BOL.pdf", document_type: "bol", storage_path: `${ORG_ID}/LP-2401_BOL.pdf`, scan_status: "pending", created_at: "2026-06-07T08:30:00Z" },
  { id: "77777777-7777-4777-8777-777777777703", load_id: loads[3].id, file_name: "LP-2398_POD.jpg", document_type: "pod", storage_path: `${ORG_ID}/LP-2398_POD.jpg`, scan_status: "pending", created_at: "2026-06-06T17:00:00Z" },
  { id: "77777777-7777-4777-8777-777777777704", load_id: loads[3].id, file_name: "lumper_receipt_memphis.pdf", document_type: "lumper_receipt", storage_path: `${ORG_ID}/lumper_receipt_memphis.pdf`, scan_status: "pending", created_at: "2026-06-05T14:20:00Z" },
  { id: "77777777-7777-4777-8777-777777777705", load_id: null, file_name: "LP-2406_rate_con.pdf", document_type: "rate_confirmation", storage_path: `${ORG_ID}/LP-2406_rate_con.pdf`, scan_status: "pending", created_at: "2026-06-08T10:15:00Z" },
];

const claims = [
  { id: "88888888-8888-4888-8888-888888888801", load_id: loads[0].id, claim_type: "detention", amount: 225, status: "submitted", created_at: "2026-06-08T09:00:00Z" },
  { id: "88888888-8888-4888-8888-888888888802", load_id: loads[3].id, claim_type: "lumper", amount: 85, status: "draft", created_at: "2026-06-06T18:00:00Z" },
  { id: "88888888-8888-4888-8888-888888888803", load_id: loads[3].id, claim_type: "detention", amount: 180, status: "submitted", created_at: "2026-06-07T10:00:00Z" },
  { id: "88888888-8888-4888-8888-888888888804", load_id: loads[3].id, claim_type: "detention", amount: 150, status: "paid", created_at: "2026-05-28T11:00:00Z" },
];

async function upsert(table, rows, onConflict = "id") {
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function linkUserToOrg(user, label) {
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name ?? label,
  });
  if (profileError) throw new Error(`profiles: ${profileError.message}`);

  const { error: memberError } = await supabase.from("organization_members").upsert({
    organization_id: ORG_ID,
    user_id: user.id,
    role: "owner",
  }, { onConflict: "organization_id,user_id" });
  if (memberError) throw new Error(`organization_members: ${memberError.message}`);
}

async function ensureDemoUser() {
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 100 });
  let user = list?.users?.find((u) => u.email?.toLowerCase() === DEMO_EMAIL);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "LaneOS Owner" },
    });
    if (error) {
      console.warn(`Could not create demo user (${error.message}). Linking existing accounts instead.`);
      return null;
    }
    user = data.user;
    console.log(`Created demo user ${DEMO_EMAIL}`);
  } else {
    console.log(`Demo user already exists`);
  }

  await linkUserToOrg(user, "LaneOS Owner");
  return user;
}

async function linkExistingUsers() {
  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", ORG_ID);

  const linked = new Set((members ?? []).map((m) => m.user_id));
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 100 });

  for (const user of list?.users ?? []) {
    if (linked.has(user.id)) continue;
    await linkUserToOrg(user, "Fleet Owner");
    console.log(`Linked account to Koper Express LLC`);
  }
}

async function main() {
  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", ORG_ID)
    .maybeSingle();

  if (existing) {
    console.log("Seed org already exists — refreshing data...");
  }

  await upsert("organizations", [{
    id: ORG_ID,
    name: "Koper Express LLC",
    mc_number: "MC-482910",
    dot_number: "DOT-3392014",
  }]);

  const withOrg = (rows) => rows.map((r) => ({ ...r, organization_id: ORG_ID }));

  await upsert("brokers", withOrg(brokers));
  await upsert("drivers", withOrg(drivers));
  await upsert("trucks", withOrg(trucks));
  await upsert("facilities", withOrg(facilities));
  await upsert("loads", withOrg(loads));
  await upsert("documents", withOrg(documents));
  await upsert("revenue_claims", withOrg(claims));

  await upsert("broker_interactions", withOrg([
    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01", broker_id: brokers[0].id, interaction_type: "email", subject: "Load offer — Dallas to Atlanta", body: "Sent rate confirmation for LP-2401", created_at: "2026-06-06T10:00:00Z" },
    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02", broker_id: brokers[0].id, interaction_type: "call", subject: "Detention claim follow-up", body: "Confirmed $225 detention will be added to settlement", created_at: "2026-06-08T14:30:00Z" },
  ]));

  await ensureDemoUser();
  await linkExistingUsers();

  console.log("\nSeed complete.");
  console.log(`Organization: Koper Express LLC (${ORG_ID})`);
  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
