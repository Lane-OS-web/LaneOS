import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { analyzeRevenueRecovery } from "@/lib/ai/parser";
import { demoLoads, demoResponse, isDemoMode } from "@/lib/api-demo";

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { loadId, notes } = await request.json();
  if (!loadId) {
    return NextResponse.json({ error: "Load ID required" }, { status: 400 });
  }

  if (isDemoMode()) {
    const load = demoLoads.find((l) => l.id === loadId) ?? demoLoads[3];
    const analysis = await analyzeRevenueRecovery(load, [
      notes ?? "Receiver detention 2.5 hours, lumper $85",
    ]);
    return demoResponse({ analysis });
  }

  const supabase = await createClient();

  const { data: load } = await supabase
    .from("loads")
    .select("*")
    .eq("id", loadId)
    .eq("organization_id", org.id)
    .single();

  if (!load) {
    return NextResponse.json({ error: "Load not found" }, { status: 404 });
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("file_name, document_type, parsed_data")
    .eq("load_id", loadId);

  const docTexts = (documents ?? []).map(
    (d) => `${d.document_type}: ${d.file_name} ${JSON.stringify(d.parsed_data ?? {})}`
  );
  if (notes) docTexts.push(`User notes: ${notes}`);

  const analysis = await analyzeRevenueRecovery(load, docTexts);

  return NextResponse.json({ analysis });
}
