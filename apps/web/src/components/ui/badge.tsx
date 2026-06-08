import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  available: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  booked: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
  dispatched: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
  in_transit: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  invoiced: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100",
  paid: "bg-green-50 text-green-700 ring-1 ring-green-100",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-100",
  draft: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  submitted: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  denied: "bg-red-50 text-red-700 ring-1 ring-red-100",
  processing: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  organized: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
};

export function Badge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        statusColors[status] ?? "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
        className
      )}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
