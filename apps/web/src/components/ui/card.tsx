import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({
  className,
  variant = "surface",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "surface" | "navy" }) {
  return (
    <div
      className={cn(
        "rounded-xl p-6",
        variant === "surface" &&
          "border border-slate-200 bg-white text-slate-900 shadow-sm",
        variant === "navy" &&
          "border border-white/8 bg-navy-800/60 text-slate-100",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-4 flex items-center justify-between", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold tracking-tight", className)}
      {...props}
    />
  );
}
