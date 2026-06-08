import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-white text-navy-900 hover:bg-slate-100": variant === "primary",
            "bg-accent text-white hover:bg-accent-hover": variant === "accent",
            "bg-navy-800 text-slate-100 hover:bg-navy-700 border border-white/10":
              variant === "secondary",
            "text-slate-300 hover:bg-white/5 hover:text-white":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-500": variant === "danger",
            "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50":
              variant === "outline",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
