import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { demoResponse, isDemoMode } from "@/lib/api-demo";

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { parsed, rawText } = await request.json();

  if (isDemoMode()) {
    return demoResponse({
      load: {
        id: "demo-6",
        load_number: parsed.load_number ?? "LP-2408",
        status: "booked",
        rate: parsed.rate ?? 1780,
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
          payment_terms: parsed.payment_terms,
        })
        .select()
        .single();
      brokerId = newBroker?.id ?? null;
    }
  }

  const totalRevenue =
    (parsed.rate ?? 0) + (parsed.fuel_surcharge ?? 0);
  const ratePerMile =
    parsed.rate && parsed.miles ? parsed.rate / parsed.miles : null;

  const { data: load, error } = await supabase
    .from("loads")
    .insert({
      organization_id: org.id,
      load_number: parsed.load_number,
      reference_number: parsed.reference_number,
      broker_id: brokerId,
      pickup_date: parsed.pickup_date,
      delivery_date: parsed.delivery_date,
      rate: parsed.rate,
      fuel_surcharge: parsed.fuel_surcharge,
      total_revenue: totalRevenue,
      rate_per_mile: ratePerMile,
      miles: parsed.miles,
      commodity: parsed.commodity,
      weight_lbs: parsed.weight_lbs,
      notes: [parsed.pickup_address, parsed.delivery_address, parsed.detention_policy]
        .filter(Boolean)
        .join(" | "),
      status: "booked",
      ai_parsed: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("rate_confirmations").insert({
    organization_id: org.id,
    load_id: load.id,
    ...parsed,
    parsed_data: parsed,
    raw_text: rawText,
    confidence: parsed.confidence,
  });

  return NextResponse.json({ load });
}
