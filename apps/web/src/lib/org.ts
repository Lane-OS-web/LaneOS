import { createClient } from "@/lib/supabase/server";
import { demoOrg, isDemoMode } from "@/lib/demo";

export async function getCurrentOrganization() {
  if (isDemoMode()) return demoOrg;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const org = membership?.organizations;
  const organization = Array.isArray(org) ? org[0] : org;

  if (organization) {
    return {
      id: membership!.organization_id as string,
      role: membership!.role as string,
      organization: organization as {
        id: string;
        name: string;
        mc_number?: string;
        dot_number?: string;
      },
    };
  }

  return null;
}

export async function ensureOrganization(
  userId: string,
  orgName: string,
  mcNumber?: string
) {
  const supabase = await createClient();

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: orgName,
      mc_number: mcNumber || null,
    })
    .select()
    .single();

  if (orgError) throw orgError;

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: userId,
      role: "owner",
    });

  if (memberError) throw memberError;

  return org;
}
