import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { demoResponse, isDemoMode } from "@/lib/api-demo";

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { parsed } = await request.json();

  if (isDemoMode()) {
    return demoResponse({
      load: {
        id: "demo-5",
        load_number: parsed.load_number ?? "LP-2407",
        status: "booked",
        rate: parsed.rate ?? 2850,
        ...parsed,
      },
    });
  }

  const supabase = await createClient();

  let brokerId: string | null = null;
  if (parsed.broker_name) {
    const { data: existing } = await supabase
      .from("brokers")
      .select("id")
      .eq("organization_id", org.id)
      .ilike("name", parsed.broker_name)
      .limit(1)
      .single();

    if (existing) {
      brokerId = existing.id;
    } else {
      const { data: newBroker } = await supabase
        .from("brokers")
        .insert({
          organization_id: org.id,
          name: parsed.broker_name,
          contact_email: parsed.contact_email,
          contact_phone: parsed.contact_phone,
        })
        .select()
        .single();
      brokerId = newBroker?.id ?? null;
    }
  }

  const { data: load, error } = await supabase
    .from("loads")
    .insert({
      organization_id: org.id,
      load_number: parsed.load_number,
      broker_id: brokerId,
      pickup_date: parsed.pickup_date,
      delivery_date: parsed.delivery_date,
      rate: parsed.rate,
      commodity: parsed.commodity,
      weight_lbs: parsed.weight_lbs,
      total_revenue: parsed.rate,
      notes: [parsed.origin, parsed.destination, parsed.notes]
        .filter(Boolean)
        .join(" | "),
      status: "booked",
      ai_parsed: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ load });
}
