import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { demoLoads, demoResponse, isDemoMode } from "@/lib/api-demo";

export async function GET() {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoMode()) return demoResponse({ loads: demoLoads });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loads")
    .select("*")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ loads: data });
}

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (isDemoMode()) {
    return demoResponse({
      load: {
        id: "demo-new",
        load_number: body.load_number ?? "LP-NEW",
        ...body,
        status: body.status ?? "booked",
      },
    });
  }

  const supabase = await createClient();

  const rate = body.rate ?? null;
  const miles = body.miles ?? null;
  const ratePerMile = rate && miles ? rate / miles : null;
  const totalRevenue = rate
    ? rate + (body.fuel_surcharge ?? 0) + (body.accessorials ?? 0)
    : null;

  const { data, error } = await supabase
    .from("loads")
    .insert({
      organization_id: org.id,
      ...body,
      rate_per_mile: ratePerMile,
      total_revenue: totalRevenue,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ load: data });
}
