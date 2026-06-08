import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  delta,
  deltaLabel,
  positive = true,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  delta?: string;
  deltaLabel?: string;
  positive?: boolean;
}) {
  const content = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
        {delta && (
          <div className="mt-2 flex items-center gap-1.5">
            {positive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                positive ? "text-emerald-600" : "text-red-500"
              )}
            >
              {delta}
            </span>
            {deltaLabel && (
              <span className="text-xs text-slate-400">{deltaLabel}</span>
            )}
          </div>
        )}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
    </div>
  );

  const className =
    "rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
