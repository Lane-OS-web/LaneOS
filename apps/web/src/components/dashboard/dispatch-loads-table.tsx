"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Filter,
  MapPin,
  MoreHorizontal,
  Navigation,
  Search,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type LoadRow = {
  id: string;
  load_number?: string | null;
  status: string;
  rate?: number | null;
  pickup_date?: string | null;
  delivery_date?: string | null;
  miles?: number | null;
};

const statusColor: Record<string, { bg: string; text: string; dot: string }> = {
  in_transit: { bg: "rgba(59,130,246,0.12)", text: "#3B82F6", dot: "#3B82F6" },
  dispatched: { bg: "rgba(59,130,246,0.12)", text: "#3B82F6", dot: "#3B82F6" },
  booked: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", dot: "#F59E0B" },
  delivered: { bg: "rgba(22,199,132,0.12)", text: "#16C784", dot: "#16C784" },
  available: { bg: "rgba(139,163,204,0.12)", text: "#8BA3CC", dot: "#8BA3CC" },
};

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function progressForStatus(status: string) {
  if (status === "delivered") return 100;
  if (status === "in_transit") return 68;
  if (status === "dispatched") return 40;
  if (status === "booked") return 12;
  return 0;
}

export function DispatchLoadsTable({ loads }: { loads: LoadRow[] }) {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [searchVal, setSearchVal] = useState("");

  const activeStatuses = ["booked", "dispatched", "in_transit", "available"];
  const historyStatuses = ["delivered", "invoiced", "paid", "cancelled"];

  const tabLoads = loads.filter((l) =>
    activeTab === "active"
      ? activeStatuses.includes(l.status)
      : historyStatuses.includes(l.status)
  );

  const filtered = tabLoads.filter(
    (l) =>
      (l.load_number ?? l.id).toLowerCase().includes(searchVal.toLowerCase()) ||
      l.status.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="panel-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--lp-border)] px-6 py-5">
        <div className="flex items-center gap-4">
          {(["active", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-[7px] px-3.5 py-1.5 text-[13px] capitalize transition-colors ${
                activeTab === tab
                  ? "border border-accent/25 bg-[var(--lp-blue-dim)] font-semibold text-accent"
                  : "border border-transparent text-[var(--lp-text-secondary)]"
              }`}
            >
              {tab === "active" ? "Active Loads" : "History"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-navy-mid)] px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-[var(--lp-text-tertiary)]" />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search loads..."
              className="w-40 bg-transparent text-[13px] text-[var(--lp-text-primary)] outline-none"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-navy-mid)] px-3 py-1.5 text-[13px] text-[var(--lp-text-secondary)]">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
        </div>
      </div>

      <div className="hidden border-b border-[var(--lp-border)] px-6 py-2.5 md:grid md:grid-cols-[100px_1fr_1fr_80px_100px_110px_90px_40px]">
        {["Load ID", "Pickup", "Delivery", "Miles", "Rate", "Status", "Progress", ""].map(
          (h) => (
            <span
              key={h}
              className="text-[11px] font-semibold uppercase tracking-wider text-[var(--lp-text-tertiary)]"
            >
              {h}
            </span>
          )
        )}
      </div>

      {filtered.length ? (
        filtered.map((load, i) => {
          const s = statusColor[load.status] ?? statusColor.available;
          const progress = progressForStatus(load.status);
          const rpm =
            load.rate && load.miles
              ? `$${(load.rate / load.miles).toFixed(2)}`
              : null;

          return (
            <Link
              key={load.id}
              href={`/dashboard/loads/${load.id}`}
              className={`block px-6 py-3.5 transition-colors hover:bg-white/[0.02] md:grid md:grid-cols-[100px_1fr_1fr_80px_100px_110px_90px_40px] md:items-center ${
                i < filtered.length - 1 ? "border-b border-[var(--lp-border)]" : ""
              }`}
            >
              <span className="font-mono text-[13px] font-semibold text-accent">
                {load.load_number ?? load.id.slice(0, 8)}
              </span>
              <div className="mt-2 flex items-center gap-1.5 md:mt-0">
                <MapPin className="h-3 w-3 text-[var(--lp-text-tertiary)]" />
                <span className="text-[13px] text-[var(--lp-text-secondary)]">
                  PU {formatDate(load.pickup_date)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 md:mt-0">
                <Navigation className="h-3 w-3 text-[var(--lp-text-tertiary)]" />
                <span className="text-[13px] text-[var(--lp-text-secondary)]">
                  {load.delivery_date
                    ? `DEL ${formatDate(load.delivery_date)}`
                    : "—"}
                </span>
              </div>
              <span className="mt-1 text-[13px] text-[var(--lp-text-secondary)] md:mt-0">
                {load.miles ?? "—"}
              </span>
              <div className="mt-1 md:mt-0">
                <div className="text-[13px] font-semibold text-[var(--lp-text-primary)]">
                  {formatCurrency(load.rate)}
                </div>
                {rpm && (
                  <div className="text-[11px] text-[var(--lp-text-tertiary)]">
                    {rpm}/mi
                  </div>
                )}
              </div>
              <div className="mt-2 md:mt-0">
                <span
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: s.bg, color: s.text }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: s.dot }}
                  />
                  {statusLabel(load.status)}
                </span>
              </div>
              <div className="mt-2 pr-2 md:mt-0">
                <div className="h-1.5 overflow-hidden rounded bg-[var(--lp-navy-mid)]">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${progress}%`,
                      background:
                        progress === 100
                          ? "var(--lp-green)"
                          : load.status === "booked"
                            ? "var(--lp-amber)"
                            : "var(--lp-blue)",
                    }}
                  />
                </div>
                <p className="mt-0.5 text-[10px] text-[var(--lp-text-tertiary)]">
                  {progress}%
                </p>
              </div>
              <MoreHorizontal className="mt-2 h-4 w-4 text-[var(--lp-text-tertiary)] md:mt-0" />
            </Link>
          );
        })
      ) : (
        <div className="px-6 py-12 text-center text-sm text-[var(--lp-text-secondary)]">
          No {activeTab} loads found.
        </div>
      )}
    </div>
  );
}
