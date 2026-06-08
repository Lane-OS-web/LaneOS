import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { demoResponse, isDemoMode } from "@/lib/api-demo";

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { loadId, claims } = await request.json();
  if (!loadId || !claims?.length) {
    return NextResponse.json({ error: "Load ID and claims required" }, { status: 400 });
  }

  if (isDemoMode()) {
    return demoResponse({ claims, message: "Claims saved in demo mode" });
  }

  const supabase = await createClient();

  const records = claims.map(
    (c: {
      claim_type: string;
      amount: number;
      description: string;
      detention_hours?: number;
    }) => ({
      organization_id: org.id,
      load_id: loadId,
      claim_type: c.claim_type,
      amount: c.amount,
      description: c.description,
      detention_hours: c.detention_hours,
      status: "draft",
    })
  );

  const { data, error } = await supabase
    .from("revenue_claims")
    .insert(records)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ claims: data });
}
