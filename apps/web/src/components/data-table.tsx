import { cn } from "@/lib/utils";

export function DataTable({
  headers,
  children,
  emptyMessage = "No records found.",
  isEmpty,
}: {
  headers: string[];
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-12 text-center text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DataRow({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const Tag = href ? "a" : "tr";
  return (
    <Tag
      {...(href ? { href } : {})}
      className={cn(
        "border-b border-slate-100 transition-colors last:border-0",
        href && "block table-row cursor-pointer hover:bg-slate-50",
        !href && "hover:bg-slate-50",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function DataCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3.5 text-slate-600", className)}>{children}</td>
  );
}
