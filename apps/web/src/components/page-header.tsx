import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PageHeader({
  title,
  description,
  action,
  actionLabel,
  actionHref,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        )}
      </div>
      {action ??
        (actionHref && actionLabel ? (
          <Link href={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        ) : null)}
    </div>
  );
}
