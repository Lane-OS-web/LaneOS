import { NextResponse } from "next/server";
import { getCurrentOrganization } from "@/lib/org";
import { buildAuthUrl, type EmailProvider } from "@/lib/email/providers";
import { isDemoMode } from "@/lib/api-demo";

export async function GET(request: Request) {
  const org = await getCurrentOrganization();
  if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider") as EmailProvider;

  if (!provider || !["gmail", "outlook"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({
      error:
        "Connect Supabase and OAuth credentials to link a real email account. Demo mode shows sample data.",
      demo: true,
    });
  }

  const state = Buffer.from(
    JSON.stringify({ orgId: org.id, provider })
  ).toString("base64url");

  try {
    const url = buildAuthUrl(provider, state);
    return NextResponse.redirect(url);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "OAuth not configured" },
      { status: 500 }
    );
  }
}
