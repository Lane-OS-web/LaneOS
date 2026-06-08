import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { isDemoMode } from "@/lib/api-demo";

const demoIntegrations = [
  {
    id: "demo-gmail",
    provider: "gmail",
    email_address: "dispatch@koperexpress.com",
    auto_scan: true,
    auto_send: true,
    status: "active",
    last_sync_at: new Date().toISOString(),
  },
];

export async function GET() {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoMode()) {
    return NextResponse.json({ integrations: demoIntegrations, demo: true });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_integrations")
    .select(
      "id, provider, email_address, auto_scan, auto_send, status, last_sync_at, scan_filters, created_at"
    )
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ integrations: data });
}

export async function PATCH(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoMode()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("email_integrations")
    .update({
      auto_scan: body.auto_scan,
      auto_send: body.auto_send,
      scan_filters: body.scan_filters,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .eq("organization_id", org.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ integration: data });
}

export async function DELETE(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoMode()) return NextResponse.json({ ok: true, demo: true });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from("email_integrations")
    .delete()
    .eq("id", id)
    .eq("organization_id", org.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
