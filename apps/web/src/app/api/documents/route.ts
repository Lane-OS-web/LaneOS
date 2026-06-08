import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { demoBlocked, isDemoMode } from "@/lib/api-demo";
import {
  scanDocumentContent,
  buildParsedDataRecord,
} from "@/lib/ai/document-scanner";
import { matchDocumentToLoad } from "@/lib/documents/match-load";

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoMode()) return demoBlocked();

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const documentType = (formData.get("document_type") as string) || "other";
  const loadId = (formData.get("load_id") as string) || null;
  const autoScan = formData.get("auto_scan") !== "false";

  if (!file) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const storagePath = `${org.id}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  let scanResult = null;
  let matchedLoadId = loadId;
  let finalType = documentType;
  let scanStatus = autoScan ? "processing" : "skipped";

  if (autoScan) {
    try {
      scanResult = await scanDocumentContent(
        buffer,
        file.type,
        file.name,
        documentType !== "other" ? documentType : undefined
      );
      finalType = scanResult.parsed.document_type;
      matchedLoadId = await matchDocumentToLoad(
        supabase,
        org.id,
        scanResult.parsed,
        loadId
      );
      scanStatus = "completed";
    } catch {
      scanStatus = "failed";
    }
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      organization_id: org.id,
      load_id: matchedLoadId,
      document_type: finalType,
      file_name: file.name,
      storage_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user?.id,
      scan_status: scanStatus,
      extracted_text: scanResult?.extractedText?.slice(0, 50000) ?? null,
      scan_confidence: scanResult?.parsed.confidence ?? null,
      parsed_data: scanResult
        ? buildParsedDataRecord(scanResult.parsed)
        : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (finalType === "rate_confirmation" && scanResult?.extractedText) {
    await supabase.from("rate_confirmations").insert({
      organization_id: org.id,
      document_id: data.id,
      load_id: matchedLoadId,
      broker_name: scanResult.parsed.broker_name,
      load_number: scanResult.parsed.load_number,
      rate: scanResult.parsed.rate,
      commodity: scanResult.parsed.commodity,
      weight_lbs: scanResult.parsed.weight_lbs,
      parsed_data: scanResult.parsed,
      raw_text: scanResult.extractedText.slice(0, 20000),
      confidence: scanResult.parsed.confidence,
    });
  }

  return NextResponse.json({
    document: data,
    scan: scanResult
      ? {
          status: scanStatus,
          parsed: scanResult.parsed,
          matched_load_id: matchedLoadId,
        }
      : null,
  });
}
