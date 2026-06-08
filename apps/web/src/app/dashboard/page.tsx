import {
  Package,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  Zap,
  CheckCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { DispatchLoadsTable } from "@/components/dashboard/dispatch-loads-table";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/org";
import { demoDashboard, demoOrg, isDemoMode } from "@/lib/demo";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

async function getDashboardData() {
  if (isDemoMode()) {
    return {
      org: demoOrg,
      activeLoads: demoDashboard.activeLoads,
      totalDrivers: demoDashboard.totalDrivers,
      recentLoads: demoDashboard.recentLoads,
      pendingClaims: demoDashboard.pendingClaims,
      totalRevenue: demoDashboard.totalRevenue,
      recoverable: demoDashboard.pendingClaims.reduce((s, c) => s + c.amount, 0),
      bookedToday: demoDashboard.bookedToday,
      docsToReview: 3,
    };
  }

  const org = await getCurrentOrganization();
  const supabase = await createClient();
  const orgId = org!.id;

  const [
    { count: activeLoads },
    { count: totalDrivers },
    { data: recentLoads },
    { data: pendingClaims },
    { data: revenueData },
    { count: bookedToday },
    { count: docsToReview },
  ] = await Promise.all([
    supabase
      .from("loads")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .in("status", ["booked", "dispatched", "in_transit"]),
    supabase
      .from("drivers")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "active"),
    supabase
      .from("loads")
      .select(
        "id, load_number, status, rate, pickup_date, delivery_date, miles"
      )
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("revenue_claims")
      .select("id, claim_type, amount, status")
      .eq("organization_id", orgId)
      .in("status", ["draft", "submitted"])
      .limit(5),
    supabase
      .from("loads")
      .select("total_revenue, rate")
      .eq("organization_id", orgId)
      .in("status", ["delivered", "invoiced", "paid"]),
    supabase
      .from("loads")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "booked")
      .gte("created_at", new Date().toISOString().split("T")[0]),
    supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .in("scan_status", ["pending", "processing"]),
  ]);

  const totalRevenue =
    revenueData?.reduce(
      (sum, l) => sum + (l.total_revenue ?? l.rate ?? 0),
      0
    ) ?? 0;

  const recoverable = pendingClaims?.reduce((sum, c) => sum + c.amount, 0) ?? 0;

  return {
    org,
    activeLoads: activeLoads ?? 0,
    totalDrivers: totalDrivers ?? 0,
    recentLoads: recentLoads ?? [],
    pendingClaims: pendingClaims ?? [],
    totalRevenue,
    recoverable,
    bookedToday: bookedToday ?? 0,
    docsToReview: docsToReview ?? 0,
  };
}

export default async function DashboardPage() {
  const {
    org,
    activeLoads,
    totalDrivers,
    recentLoads,
    pendingClaims,
    totalRevenue,
    recoverable,
    bookedToday,
    docsToReview,
  } = await getDashboardData();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-brand-green">Operations live</p>
          <h1 className="mt-1 text-[1.4rem] font-bold tracking-tight text-white">
            Dispatch Overview
          </h1>
          <p className="mt-1 text-sm text-[var(--lp-text-secondary)]">
            {today} · {activeLoads} active loads ·{" "}
            {org?.organization?.name ?? "your organization"}
          </p>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <button className="flex items-center gap-2 rounded-[9px] border border-[var(--lp-border)] bg-[var(--lp-navy-panel)] px-4 py-2 text-[13px] text-[var(--lp-text-secondary)]">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <Link
            href="/dashboard/loads/new"
            className="flex items-center gap-2 rounded-[9px] bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> New Load
          </Link>
          <Link
            href="/dashboard/booking"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-navy-900 transition-colors hover:bg-slate-100"
          >
            <Zap className="h-4 w-4" />
            Book loads
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue Today"
          value={formatCurrency(totalRevenue > 0 ? totalRevenue / 30 : 24180)}
          icon={DollarSign}
          href="/dashboard/revenue"
          delta="+12.4%"
          deltaLabel="vs yesterday"
          positive
        />
        <StatCard
          label="Active Loads"
          value={activeLoads}
          icon={Package}
          href="/dashboard/loads"
          delta={bookedToday ? `+${bookedToday}` : "+2"}
          deltaLabel="since 6am"
          positive
        />
        <StatCard
          label="Detention Claims"
          value={formatCurrency(recoverable)}
          icon={Clock}
          href="/dashboard/revenue"
          delta={
            pendingClaims?.length
              ? `${pendingClaims.length} loads`
              : "3 loads"
          }
          deltaLabel="pending capture"
          positive={false}
        />
        <StatCard
          label="On-Time Rate"
          value="91%"
          icon={CheckCircle}
          href="/dashboard/loads"
          delta="+3%"
          deltaLabel="this week"
          positive
        />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <RevenueChart />
        <AlertsPanel
          pendingClaims={pendingClaims}
          docsToReview={docsToReview}
        />
      </div>

      <DispatchLoadsTable loads={recentLoads} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Active Drivers</p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {totalDrivers}
          </p>
          <Link
            href="/dashboard/drivers"
            className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
          >
            Manage fleet
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Revenue Recovery Queue
            </p>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-brand-green">
            {formatCurrency(recoverable)}
          </p>
          <Link
            href="/dashboard/revenue"
            className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
          >
            Manage claims
          </Link>
        </div>
      </div>
    </div>
  );
}
