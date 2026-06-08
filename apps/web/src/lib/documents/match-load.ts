import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScannedDocumentData } from "@/lib/ai/document-scanner";

export async function matchDocumentToLoad(
  supabase: SupabaseClient,
  orgId: string,
  parsed: ScannedDocumentData,
  explicitLoadId?: string | null
): Promise<string | null> {
  if (explicitLoadId) return explicitLoadId;

  const identifiers = [parsed.load_number, parsed.reference_number].filter(
    Boolean
  ) as string[];

  for (const id of identifiers) {
    const { data: byLoadNumber } = await supabase
      .from("loads")
      .select("id")
      .eq("organization_id", orgId)
      .ilike("load_number", id)
      .limit(1)
      .maybeSingle();

    if (byLoadNumber?.id) return byLoadNumber.id;

    const { data: byRef } = await supabase
      .from("loads")
      .select("id")
      .eq("organization_id", orgId)
      .ilike("reference_number", id)
      .limit(1)
      .maybeSingle();

    if (byRef?.id) return byRef.id;
  }

  return null;
}
