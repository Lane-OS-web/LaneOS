import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { isDemoMode } from "@/lib/api-demo";
import { syncEmailIntegration } from "@/lib/email/sync";

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoMode()) {
    return NextResponse.json({
      fetched: 3,
      processed: 2,
      loadsCreated: 1,
      demo: true,
    });
  }

  const body = await request.json().catch(() => ({}));
  const supabase = await createClient();

  let query = supabase
    .from("email_integrations")
    .select("*")
    .eq("organization_id", org.id)
    .eq("status", "active");

  if (body.integrationId) {
    query = query.eq("id", body.integrationId);
  }

  const { data: integrations, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!integrations?.length) {
    return NextResponse.json({ error: "No integrations found" }, { status: 404 });
  }

  const results = [];
  for (const integration of integrations) {
    try {
      const result = await syncEmailIntegration(supabase, integration);
      results.push({ id: integration.id, ...result });
    } catch (err) {
      results.push({
        id: integration.id,
        error: err instanceof Error ? err.message : "Sync failed",
      });
    }
  }

  return NextResponse.json({ results });
}
