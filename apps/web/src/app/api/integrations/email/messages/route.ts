import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { isDemoMode } from "@/lib/api-demo";

const demoMessages = [
  {
    id: "msg-1",
    subject: "Load offer: Dallas TX → Atlanta GA — $2,850",
    sender: "loads@summitlogistics.com",
    received_at: new Date().toISOString(),
    auto_processed: true,
    direction: "inbound",
    parsed_emails: {
      parsed_data: {
        load_number: "LP-2407",
        broker_name: "Summit Logistics",
        rate: 2850,
        origin: "Dallas, TX",
        destination: "Atlanta, GA",
      },
      confidence: 0.94,
      status: "parsed",
    },
  },
  {
    id: "msg-2",
    subject: "Rate confirmation — LP-2403",
    sender: "dispatch@heartlandfreight.com",
    received_at: new Date(Date.now() - 3600000).toISOString(),
    auto_processed: true,
    direction: "inbound",
    parsed_emails: {
      parsed_data: { load_number: "LP-2403", rate: 3200 },
      confidence: 0.88,
      status: "booked",
    },
  },
];

export async function GET() {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoMode()) {
    return NextResponse.json({ messages: demoMessages, demo: true });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_messages")
    .select(
      "*, parsed_emails(parsed_data, confidence, status, load_id), email_integrations(email_address, provider)"
    )
    .eq("organization_id", org.id)
    .order("received_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}
