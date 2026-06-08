import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { demoBlocked, isDemoMode } from "@/lib/api-demo";

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoMode()) return demoBlocked();

  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("drivers")
    .insert({ organization_id: org.id, ...body })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ driver: data });
}
