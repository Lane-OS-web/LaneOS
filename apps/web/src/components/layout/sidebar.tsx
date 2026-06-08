"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  Package,
  Users,
  FileText,
  Building2,
  MapPin,
  Mail,
  FileCheck,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Zap,
  Clock,
  Inbox,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const primaryNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/booking", label: "Load Booking", icon: Zap },
  { href: "/dashboard/email-inbox", label: "Email Inbox", icon: Inbox },
  { href: "/dashboard/loads", label: "Active Loads", icon: Package },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/revenue", label: "Revenue Recovery", icon: DollarSign },
  { href: "/dashboard/integrations", label: "Integrations", icon: Link2 },
];

const secondaryNav = [
  { href: "/dashboard/drivers", label: "Drivers", icon: Users },
  { href: "/dashboard/trucks", label: "Trucks", icon: Truck },
  { href: "/dashboard/brokers", label: "Brokers", icon: Building2 },
  { href: "/dashboard/facilities", label: "Facilities", icon: MapPin },
  { href: "/dashboard/email-parser", label: "Email Parser", icon: Mail },
  { href: "/dashboard/rate-confirmation", label: "Rate Con Parser", icon: FileCheck },
];

export function Sidebar({
  orgName,
  demoMode,
}: {
  orgName?: string;
  demoMode?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    if (demoMode) {
      router.push("/");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function NavLink({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }) {
    const isActive =
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href));

    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-white/8 bg-navy-950">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/8 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
          <Truck className="h-4 w-4 text-navy-900" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">LaneOS</p>
          {orgName && (
            <p className="truncate text-xs text-slate-500">{orgName}</p>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Operations
          </p>
          <div className="space-y-0.5">
            {primaryNav.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Fleet
          </p>
          <div className="space-y-0.5">
            {secondaryNav.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-white/8 p-4">
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-300">Detention tracking active</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
