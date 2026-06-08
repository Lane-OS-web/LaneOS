import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForTokens,
  type EmailProvider,
} from "@/lib/email/providers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error || !code || !state) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?error=oauth_denied`
    );
  }

  let parsed: { orgId: string; provider: EmailProvider };
  try {
    parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
  } catch {
    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?error=invalid_state`
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(parsed.provider, code);
    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from("email_integrations")
      .upsert(
        {
          organization_id: parsed.orgId,
          provider: parsed.provider,
          email_address: tokens.email,
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          token_expires_at: tokens.expiresAt?.toISOString(),
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id,email_address" }
      );

    if (dbError) throw dbError;

    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?connected=${parsed.provider}`
    );
  } catch {
    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?error=connection_failed`
    );
  }
}
