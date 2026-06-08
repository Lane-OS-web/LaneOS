import {
  AlertTriangle,
  Clock,
  DollarSign,
  Fuel,
  Package,
  type LucideIcon,
} from "lucide-react";

type AlertItem = {
  type: "detention" | "docs" | "payment" | "fuel";
  driver?: string;
  msg: string;
  time: string;
  severity: "high" | "medium" | "low";
};

const alertIcon: Record<AlertItem["type"], LucideIcon> = {
  detention: Clock,
  docs: Package,
  payment: DollarSign,
  fuel: Fuel,
};

const alertColor: Record<AlertItem["severity"], string> = {
  high: "#EA3943",
  medium: "#F59E0B",
  low: "#8BA3CC",
};

function buildAlerts(
  pendingClaims: { claim_type: string; amount: number }[],
  docCount: number
): AlertItem[] {
  const alerts: AlertItem[] = [];

  pendingClaims.slice(0, 2).forEach((claim, i) => {
    alerts.push({
      type: claim.claim_type.includes("detention") ? "detention" : "payment",
      msg:
        claim.claim_type === "detention"
          ? `Detention claim pending — ${claim.claim_type.replace(/_/g, " ")}`
          : `Revenue claim — $${claim.amount.toLocaleString()} ${claim.claim_type.replace(/_/g, " ")}`,
      time: `${(i + 1) * 12} min ago`,
      severity: claim.claim_type === "detention" ? "high" : "medium",
    });
  });

  if (docCount > 0) {
    alerts.push({
      type: "docs",
      msg: `${docCount} document${docCount > 1 ? "s" : ""} awaiting review`,
      time: "38 min ago",
      severity: "medium",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "detention",
      msg: "Geofence monitoring active — timers start at facilities",
      time: "Live",
      severity: "low",
    });
  }

  return alerts.slice(0, 4);
}

export function AlertsPanel({
  pendingClaims,
  docsToReview = 0,
}: {
  pendingClaims: { claim_type: string; amount: number }[];
  docsToReview?: number;
}) {
  const alerts = buildAlerts(pendingClaims, docsToReview);
  const newCount = alerts.filter((a) => a.severity !== "low").length;

  return (
    <div className="panel-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[var(--lp-text-primary)]">
          Alerts
        </h3>
        {newCount > 0 && (
          <span className="rounded-full bg-[var(--lp-red-dim)] px-2 py-0.5 text-[11px] font-bold text-destructive">
            {newCount} new
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {alerts.map((a, i) => {
          const Icon = alertIcon[a.type];
          return (
            <div
              key={i}
              className="rounded-[10px] bg-[var(--lp-navy-mid)] px-3.5 py-3"
              style={{ borderLeft: `3px solid ${alertColor[a.severity]}` }}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: alertColor[a.severity] }}
                />
                <div>
                  <p className="text-xs font-medium leading-snug text-[var(--lp-text-primary)]">
                    {a.msg}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--lp-text-tertiary)]">
                    {a.driver ? `${a.driver} · ` : ""}
                    {a.time}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {pendingClaims.length === 0 && docsToReview === 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-[var(--lp-text-tertiary)]">
          <AlertTriangle className="h-3.5 w-3.5" />
          All clear — monitoring active loads
        </div>
      )}
    </div>
  );
}
