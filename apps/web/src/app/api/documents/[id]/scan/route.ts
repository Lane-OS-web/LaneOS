import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { isDemoMode } from "@/lib/api-demo";
import {
  scanDocumentContent,
  buildParsedDataRecord,
} from "@/lib/ai/document-scanner";
import { matchDocumentToLoad } from "@/lib/documents/match-load";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoMode()) {
    return NextResponse.json({
      scan: {
        status: "completed",
        parsed: {
          document_type: "bol",
          load_number: "LP-2401",
          rate: 2850,
          confidence: 0.91,
        },
        matched_load_id: "demo-1",
      },
      demo: true,
    });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("organization_id", org.id)
    .single();

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: fileData, error: downloadError } = await supabase.storage
    .from("documents")
    .download(doc.storage_path);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());

  await supabase
    .from("documents")
    .update({ scan_status: "processing" })
    .eq("id", id);

  try {
    const scanResult = await scanDocumentContent(
      buffer,
      doc.mime_type ?? "application/octet-stream",
      doc.file_name,
      doc.document_type
    );

    const matchedLoadId = await matchDocumentToLoad(
      supabase,
      org.id,
      scanResult.parsed,
      doc.load_id
    );

    const { data: updated } = await supabase
      .from("documents")
      .update({
        scan_status: "completed",
        document_type: scanResult.parsed.document_type,
        extracted_text: scanResult.extractedText.slice(0, 50000),
        scan_confidence: scanResult.parsed.confidence,
        parsed_data: buildParsedDataRecord(scanResult.parsed),
        load_id: matchedLoadId ?? doc.load_id,
      })
      .eq("id", id)
      .select()
      .single();

    return NextResponse.json({
      document: updated,
      scan: {
        status: "completed",
        parsed: scanResult.parsed,
        matched_load_id: matchedLoadId,
      },
    });
  } catch (err) {
    await supabase
      .from("documents")
      .update({ scan_status: "failed" })
      .eq("id", id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scan failed" },
      { status: 500 }
    );
  }
}
