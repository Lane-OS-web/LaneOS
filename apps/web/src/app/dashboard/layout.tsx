import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentOrganization } from "@/lib/org";
import { demoOrg, isDemoMode } from "@/lib/demo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demo = isDemoMode();
  const org = demo ? demoOrg : await getCurrentOrganization();

  if (!org) {
    redirect("/signup");
  }

  return (
    <DashboardShell
      orgName={org.organization.name}
      demoMode={demo}
    >
      {children}
    </DashboardShell>
  );
}
