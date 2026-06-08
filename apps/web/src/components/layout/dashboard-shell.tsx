import { Sidebar } from "./sidebar";

export function DashboardShell({
  children,
  orgName,
  demoMode,
}: {
  children: React.ReactNode;
  orgName?: string;
  demoMode?: boolean;
}) {
  return (
    <div className="flex h-screen bg-navy-900">
      <Sidebar orgName={orgName} demoMode={demoMode} />
      <main className="flex-1 overflow-y-auto bg-navy-900">
        {demoMode && (
          <div className="border-b border-amber-500/20 bg-amber-500/10 px-8 py-2 text-center text-xs font-medium text-amber-200">
            Demo mode — sample carrier data. Add Supabase credentials in{" "}
            <code className="rounded bg-black/20 px-1 py-0.5">.env.local</code>{" "}
            to use live data.
          </div>
        )}
        <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
