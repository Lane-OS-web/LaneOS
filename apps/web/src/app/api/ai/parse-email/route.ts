import { NextResponse } from "next/server";
import { getCurrentOrganization } from "@/lib/org";
import { parseFreightEmail } from "@/lib/ai/parser";
import { createClient } from "@/lib/supabase/server";
import { demoParsedEmail, demoResponse, isDemoMode } from "@/lib/api-demo";

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, body } = await request.json();
  if (!body) {
    return NextResponse.json({ error: "Email body required" }, { status: 400 });
  }

  if (isDemoMode()) {
    const parsed = body.trim()
      ? { ...demoParsedEmail, ...(await parseFreightEmail(subject ?? "", body)) }
      : demoParsedEmail;
    return demoResponse({ parsed });
  }

  const parsed = await parseFreightEmail(subject ?? "", body);

  const supabase = await createClient();
  await supabase.from("parsed_emails").insert({
    organization_id: org.id,
    subject,
    sender: parsed.contact_email,
    raw_body: body,
    parsed_data: parsed,
    confidence: parsed.confidence,
    status: "parsed",
  });

  return NextResponse.json({ parsed });
}
