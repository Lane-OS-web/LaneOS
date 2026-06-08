import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureOrganization } from "@/lib/org";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgName, mcNumber } = await request.json();

  if (!orgName) {
    return NextResponse.json({ error: "Organization name required" }, { status: 400 });
  }

  const existing = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (existing.data) {
    return NextResponse.json({ message: "Already onboarded" });
  }

  const SEED_ORG_ID = "11111111-1111-4111-8111-111111111111";

  try {
    const { data: seededOrg } = await supabase
      .from("organizations")
      .select("id, name, mc_number, dot_number")
      .eq("id", SEED_ORG_ID)
      .maybeSingle();

    if (seededOrg) {
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: seededOrg.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;
      return NextResponse.json({ organization: seededOrg, linked: true });
    }

    const org = await ensureOrganization(user.id, orgName, mcNumber);
    return NextResponse.json({ organization: org });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onboarding failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
