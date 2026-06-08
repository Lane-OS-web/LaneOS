import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { isDemoMode } from "@/lib/api-demo";
import { sendEmailViaProvider, EMAIL_TEMPLATES } from "@/lib/email/sync";

export async function POST(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { integrationId, to, subject, body: emailBody, templateType, loadId } =
    body;

  if (!integrationId || !to) {
    return NextResponse.json(
      { error: "integrationId and to are required" },
      { status: 400 }
    );
  }

  if (isDemoMode()) {
    return NextResponse.json({
      status: "sent",
      external_id: "demo-msg-001",
      demo: true,
    });
  }

  const supabase = await createClient();
  const { data: integration } = await supabase
    .from("email_integrations")
    .select("*")
    .eq("id", integrationId)
    .eq("organization_id", org.id)
    .single();

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  let finalSubject = subject;
  let finalBody = emailBody;

  if (templateType && loadId) {
    const { data: load } = await supabase
      .from("loads")
      .select("load_number, rate, brokers(name)")
      .eq("id", loadId)
      .single();

    const loadNumber = load?.load_number ?? loadId.slice(0, 8);
    const brokerName =
      (load?.brokers as { name?: string } | null)?.name ?? "Broker";

    if (templateType === "pod_submission") {
      const t = EMAIL_TEMPLATES.pod_submission(loadNumber, brokerName);
      finalSubject = t.subject;
      finalBody = t.body;
    } else if (templateType === "detention_notice") {
      const t = EMAIL_TEMPLATES.detention_notice(loadNumber, 2.5, 225);
      finalSubject = t.subject;
      finalBody = t.body;
    } else if (templateType === "invoice_followup") {
      const t = EMAIL_TEMPLATES.invoice_followup(
        loadNumber,
        load?.rate ?? 0
      );
      finalSubject = t.subject;
      finalBody = t.body;
    }
  }

  if (!finalSubject || !finalBody) {
    return NextResponse.json(
      { error: "subject and body required" },
      { status: 400 }
    );
  }

  const { data: outboxRow } = await supabase
    .from("email_outbox")
    .insert({
      organization_id: org.id,
      integration_id: integrationId,
      to_address: to,
      subject: finalSubject,
      body: finalBody,
      template_type: templateType,
      load_id: loadId,
      status: "sending",
    })
    .select()
    .single();

  try {
    const externalId = await sendEmailViaProvider(
      integration,
      to,
      finalSubject,
      finalBody
    );

    await supabase
      .from("email_outbox")
      .update({
        status: "sent",
        external_id: externalId,
        sent_at: new Date().toISOString(),
      })
      .eq("id", outboxRow!.id);

    return NextResponse.json({ status: "sent", external_id: externalId });
  } catch (err) {
    await supabase
      .from("email_outbox")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Send failed",
      })
      .eq("id", outboxRow!.id);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Send failed" },
      { status: 500 }
    );
  }
}
