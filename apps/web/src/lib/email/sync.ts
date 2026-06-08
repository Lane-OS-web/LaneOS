import type { SupabaseClient } from "@supabase/supabase-js";
import { parseFreightEmail } from "@/lib/ai/parser";
import {
  type EmailIntegration,
  type InboundEmail,
  refreshAccessToken,
} from "@/lib/email/providers";

function shouldProcessEmail(
  subject: string,
  sender: string,
  filters: EmailIntegration["scan_filters"]
) {
  const keywords = filters.subject_keywords ?? [
    "load",
    "rate",
    "pickup",
    "freight",
    "offer",
    "confirmation",
  ];
  const subjectLower = subject.toLowerCase();
  const matchesKeyword = keywords.some((k) =>
    subjectLower.includes(k.toLowerCase())
  );

  const domains = filters.broker_domains ?? [];
  const senderDomain = sender.split("@")[1]?.toLowerCase() ?? "";
  const matchesDomain =
    domains.length === 0 ||
    domains.some((d) => senderDomain.includes(d.toLowerCase()));

  return matchesKeyword || matchesDomain;
}

async function fetchGmailMessages(
  accessToken: string,
  after?: string
): Promise<{ messages: InboundEmail[]; cursor?: string }> {
  const query = after
    ? `after:${Math.floor(new Date(after).getTime() / 1000)}`
    : "newer_than:7d";

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=25`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!listRes.ok) throw new Error("Gmail list failed");
  const list = await listRes.json();
  const messages: InboundEmail[] = [];

  for (const item of list.messages ?? []) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!msgRes.ok) continue;
    const msg = await msgRes.json();
    const headers = msg.payload?.headers ?? [];
    const subject =
      headers.find((h: { name: string }) => h.name === "Subject")?.value ?? "";
    const from =
      headers.find((h: { name: string }) => h.name === "From")?.value ?? "";
    const date =
      headers.find((h: { name: string }) => h.name === "Date")?.value ?? "";

    let body = "";
    const parts = msg.payload?.parts ?? [msg.payload];
    for (const part of parts) {
      if (part?.mimeType === "text/plain" && part.body?.data) {
        body = Buffer.from(part.body.data, "base64url").toString("utf-8");
        break;
      }
    }
    if (!body && msg.payload?.body?.data) {
      body = Buffer.from(msg.payload.body.data, "base64url").toString("utf-8");
    }

    messages.push({
      externalId: msg.id,
      threadId: msg.threadId,
      subject,
      sender: from,
      body,
      receivedAt: date ? new Date(date).toISOString() : new Date().toISOString(),
    });
  }

  return { messages, cursor: list.resultSizeEstimate?.toString() };
}

async function fetchOutlookMessages(
  accessToken: string,
  after?: string
): Promise<{ messages: InboundEmail[]; cursor?: string }> {
  const filter = after
    ? `&$filter=receivedDateTime ge ${new Date(after).toISOString()}`
    : "";
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages?$top=25&$orderby=receivedDateTime desc${filter}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error("Outlook fetch failed");
  const data = await res.json();

  const messages: InboundEmail[] = (data.value ?? []).map(
    (m: {
      id: string;
      conversationId?: string;
      subject?: string;
      from?: { emailAddress?: { address?: string } };
      body?: { content?: string };
      receivedDateTime?: string;
    }) => ({
      externalId: m.id,
      threadId: m.conversationId,
      subject: m.subject ?? "",
      sender: m.from?.emailAddress?.address ?? "",
      body: m.body?.content ?? "",
      receivedAt: m.receivedDateTime ?? new Date().toISOString(),
    })
  );

  return { messages, cursor: data["@odata.deltaLink"] };
}

export async function sendEmailViaProvider(
  integration: EmailIntegration,
  to: string,
  subject: string,
  body: string
) {
  let accessToken = integration.access_token!;

  if (
    integration.token_expires_at &&
    new Date(integration.token_expires_at) < new Date() &&
    integration.refresh_token
  ) {
    const refreshed = await refreshAccessToken(
      integration.provider,
      integration.refresh_token
    );
    accessToken = refreshed.accessToken;
  }

  if (integration.provider === "gmail") {
    const raw = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      body,
    ].join("\r\n");
    const encoded = Buffer.from(raw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encoded }),
      }
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.id as string;
  }

  const res = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "Text", content: body },
        toRecipients: [{ emailAddress: { address: to } }],
      },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return "outlook-sent";
}

export async function syncEmailIntegration(
  supabase: SupabaseClient,
  integration: EmailIntegration
) {
  let accessToken = integration.access_token;
  let refreshToken = integration.refresh_token;
  let tokenExpiresAt = integration.token_expires_at;

  if (
    tokenExpiresAt &&
    new Date(tokenExpiresAt) < new Date() &&
    refreshToken
  ) {
    const refreshed = await refreshAccessToken(
      integration.provider,
      refreshToken
    );
    accessToken = refreshed.accessToken;
    refreshToken = refreshed.refreshToken ?? refreshToken;
    tokenExpiresAt = refreshed.expiresAt?.toISOString() ?? null;

    await supabase
      .from("email_integrations")
      .update({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
      })
      .eq("id", integration.id);
  }

  if (!accessToken) throw new Error("No access token");

  const fetcher =
    integration.provider === "gmail"
      ? fetchGmailMessages
      : fetchOutlookMessages;

  const { messages, cursor } = await fetcher(
    accessToken,
    integration.last_sync_at ?? undefined
  );

  let processed = 0;
  let loadsCreated = 0;

  for (const msg of messages) {
    const { data: existing } = await supabase
      .from("email_messages")
      .select("id")
      .eq("integration_id", integration.id)
      .eq("external_id", msg.externalId)
      .maybeSingle();

    if (existing) continue;

    const { data: emailRow } = await supabase
      .from("email_messages")
      .insert({
        organization_id: integration.organization_id,
        integration_id: integration.id,
        external_id: msg.externalId,
        thread_id: msg.threadId,
        subject: msg.subject,
        sender: msg.sender,
        raw_body: msg.body,
        received_at: msg.receivedAt,
        direction: "inbound",
      })
      .select()
      .single();

    if (!integration.auto_scan) continue;
    if (!shouldProcessEmail(msg.subject, msg.sender, integration.scan_filters))
      continue;

    const parsed = await parseFreightEmail(msg.subject, msg.body);

    const { data: parsedEmail } = await supabase
      .from("parsed_emails")
      .insert({
        organization_id: integration.organization_id,
        integration_id: integration.id,
        external_message_id: msg.externalId,
        subject: msg.subject,
        sender: msg.sender,
        raw_body: msg.body,
        parsed_data: parsed,
        confidence: parsed.confidence,
        status: "parsed",
      })
      .select()
      .single();

    if (emailRow && parsedEmail) {
      await supabase
        .from("email_messages")
        .update({
          parsed_email_id: parsedEmail.id,
          auto_processed: true,
        })
        .eq("id", emailRow.id);
    }

    if (parsed.rate && parsed.confidence && parsed.confidence >= 0.7) {
      let brokerId: string | null = null;
      if (parsed.broker_name) {
        const { data: broker } = await supabase
          .from("brokers")
          .select("id")
          .eq("organization_id", integration.organization_id)
          .ilike("name", parsed.broker_name)
          .limit(1)
          .maybeSingle();

        brokerId = broker?.id ?? null;
        if (!brokerId) {
          const { data: newBroker } = await supabase
            .from("brokers")
            .insert({
              organization_id: integration.organization_id,
              name: parsed.broker_name,
              contact_email: parsed.contact_email,
            })
            .select("id")
            .single();
          brokerId = newBroker?.id ?? null;
        }
      }

      const { data: load } = await supabase
        .from("loads")
        .insert({
          organization_id: integration.organization_id,
          load_number: parsed.load_number,
          broker_id: brokerId,
          pickup_date: parsed.pickup_date,
          delivery_date: parsed.delivery_date,
          rate: parsed.rate,
          commodity: parsed.commodity,
          weight_lbs: parsed.weight_lbs,
          status: "available",
          ai_parsed: true,
          notes: [parsed.origin, parsed.destination].filter(Boolean).join(" → "),
        })
        .select("id")
        .single();

      if (load && parsedEmail) {
        await supabase
          .from("parsed_emails")
          .update({ load_id: load.id, status: "booked" })
          .eq("id", parsedEmail.id);
        loadsCreated++;
      }
    }

    processed++;
  }

  await supabase
    .from("email_integrations")
    .update({
      last_sync_at: new Date().toISOString(),
      sync_cursor: cursor ?? integration.sync_cursor,
    })
    .eq("id", integration.id);

  return { fetched: messages.length, processed, loadsCreated };
}

export const EMAIL_TEMPLATES = {
  pod_submission: (loadNumber: string, brokerName: string) => ({
    subject: `POD attached — Load ${loadNumber}`,
    body: `Hi,\n\nPlease find the proof of delivery attached for load ${loadNumber}.\n\nThank you,\nLaneOS`,
  }),
  detention_notice: (
    loadNumber: string,
    hours: number,
    amount: number
  ) => ({
    subject: `Detention claim — Load ${loadNumber}`,
    body: `Please be advised of ${hours} hours detention on load ${loadNumber}. Claimed amount: $${amount.toFixed(2)}.\n\nPer rate confirmation terms.`,
  }),
  invoice_followup: (loadNumber: string, amount: number) => ({
    subject: `Invoice follow-up — Load ${loadNumber}`,
    body: `Following up on payment for load ${loadNumber} ($${amount.toFixed(2)}). Please confirm status.\n\nThank you.`,
  }),
};
