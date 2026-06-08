import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import {
  demoBrokers,
  demoClaims,
  demoDocuments,
  demoDrivers,
  demoFacilities,
  demoLoads,
  demoTrucks,
  isDemoMode,
} from "@/lib/demo";

export async function requireOrg() {
  const org = await getCurrentOrganization();
  if (!org) throw new Error("No organization");
  return org;
}

export async function fetchDrivers() {
  if (isDemoMode()) return demoDrivers as typeof demoDrivers;
  const org = await requireOrg();
  const supabase = await createClient();
  const { data } = await supabase
    .from("drivers")
    .select("*")
    .eq("organization_id", org.id)
    .order("last_name");
  return data ?? [];
}

export async function fetchTrucks() {
  if (isDemoMode()) return demoTrucks as typeof demoTrucks;
  const org = await requireOrg();
  const supabase = await createClient();
  const { data } = await supabase
    .from("trucks")
    .select("*")
    .eq("organization_id", org.id)
    .order("unit_number");
  return data ?? [];
}

export async function fetchLoads() {
  if (isDemoMode()) return demoLoads;
  const org = await requireOrg();
  const supabase = await createClient();
  const { data } = await supabase
    .from("loads")
    .select("*, brokers(name), drivers(first_name, last_name)")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchLoadById(id: string) {
  if (isDemoMode()) {
    const load = demoLoads.find((l) => l.id === id);
    if (!load) return null;
    return load;
  }
  const org = await requireOrg();
  const supabase = await createClient();
  const { data } = await supabase
    .from("loads")
    .select(
      "*, brokers(name, contact_email), drivers(first_name, last_name, phone), trucks(unit_number)"
    )
    .eq("id", id)
    .eq("organization_id", org.id)
    .single();
  return data;
}

export async function fetchLoadDocuments(loadId: string) {
  if (isDemoMode()) {
    return demoDocuments.filter(
      (d) => d.loads?.load_number === demoLoads.find((l) => l.id === loadId)?.load_number
    );
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("load_id", loadId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchLoadClaims(loadId: string) {
  if (isDemoMode()) {
    return demoClaims.filter((c) => c.load_id === loadId);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("revenue_claims")
    .select("*")
    .eq("load_id", loadId);
  return data ?? [];
}

export async function fetchDocuments() {
  if (isDemoMode()) return demoDocuments;
  const org = await requireOrg();
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*, loads(load_number)")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchClaims() {
  if (isDemoMode()) return demoClaims;
  const org = await requireOrg();
  const supabase = await createClient();
  const { data } = await supabase
    .from("revenue_claims")
    .select("*, loads(load_number)")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchBrokers() {
  if (isDemoMode()) return demoBrokers;
  const org = await requireOrg();
  const supabase = await createClient();
  const { data } = await supabase
    .from("brokers")
    .select("*")
    .eq("organization_id", org.id)
    .order("name");
  return data ?? [];
}

export async function fetchBrokerInteractions(brokerId: string) {
  if (isDemoMode()) return [];
  const org = await requireOrg();
  const supabase = await createClient();
  const { data } = await supabase
    .from("broker_interactions")
    .select("*")
    .eq("broker_id", brokerId)
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchBrokerById(id: string) {
  if (isDemoMode()) return demoBrokers.find((b) => b.id === id) ?? null;
  const org = await requireOrg();
  const supabase = await createClient();
  const { data } = await supabase
    .from("brokers")
    .select("*")
    .eq("id", id)
    .eq("organization_id", org.id)
    .single();
  return data;
}

export async function fetchFacilities() {
  if (isDemoMode()) return demoFacilities;
  const org = await requireOrg();
  const supabase = await createClient();
  const { data } = await supabase
    .from("facilities")
    .select("*")
    .eq("organization_id", org.id)
    .order("name");
  return data ?? [];
}

export async function fetchBookingQueue() {
  if (isDemoMode()) {
    const available = demoLoads.filter((l) =>
      ["available", "draft"].includes(l.status)
    );
    const booked = demoLoads.filter((l) => l.status === "booked");
    const activeCount = demoLoads.filter((l) =>
      ["booked", "dispatched", "in_transit"].includes(l.status)
    ).length;
    return { availableLoads: available, recentBooked: booked, bookedCount: activeCount };
  }
  const org = await requireOrg();
  const supabase = await createClient();
  const [{ data: availableLoads }, { data: recentBooked }, { count: bookedCount }] =
    await Promise.all([
      supabase
        .from("loads")
        .select(
          "id, load_number, status, rate, pickup_date, commodity, miles, brokers(name)"
        )
        .eq("organization_id", org.id)
        .in("status", ["available"])
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("loads")
        .select("id, load_number, status, rate, pickup_date, brokers(name)")
        .eq("organization_id", org.id)
        .eq("status", "booked")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("loads")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", org.id)
        .in("status", ["booked", "dispatched", "in_transit"]),
    ]);
  return {
    availableLoads: availableLoads ?? [],
    recentBooked: recentBooked ?? [],
    bookedCount: bookedCount ?? 0,
  };
}
