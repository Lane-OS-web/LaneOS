import { NextResponse } from "next/server";
import { getCurrentOrganization } from "@/lib/org";
import { parseRateConfirmation } from "@/lib/ai/parser";
import { createClient } from "@/lib/supabase/server";
import { demoResponse, isDemoMode } from "@/lib/api-demo";

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await request.json();
  if (!text) {
    return NextResponse.json({ error: "Text required" }, { status: 400 });
  }

  const parsed = await parseRateConfirmation(text);

  if (isDemoMode()) return demoResponse({ parsed });

  const supabase = await createClient();
  await supabase.from("rate_confirmations").insert({
    organization_id: org.id,
    broker_name: parsed.broker_name,
    load_number: parsed.load_number,
    pickup_address: parsed.pickup_address,
    delivery_address: parsed.delivery_address,
    pickup_date: parsed.pickup_date,
    delivery_date: parsed.delivery_date,
    rate: parsed.rate,
    commodity: parsed.commodity,
    weight_lbs: parsed.weight_lbs,
    parsed_data: parsed,
    raw_text: text,
    confidence: parsed.confidence,
  });

  return NextResponse.json({ parsed });
}
