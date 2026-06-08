import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { isDemoMode } from "@/lib/api-demo";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoMode()) {
    return NextResponse.json({ error: "Demo mode" }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (body.parsed_data) updates.parsed_data = body.parsed_data;
  if (body.document_type) updates.document_type = body.document_type;
  if (body.load_id !== undefined) updates.load_id = body.load_id;
  if (body.scan_status) updates.scan_status = body.scan_status;

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .eq("organization_id", org.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ document: data });
}
