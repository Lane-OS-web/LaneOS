"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  Navigation,
  Search,
  Shield,
  TrendingUp,
  Zap,
  DollarSign,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type LoadOffer = {
  id: string;
  load_number?: string | null;
  status: string;
  rate?: number | null;
  pickup_date?: string | null;
  commodity?: string | null;
  miles?: number | null;
  brokers?: { name: string } | { name: string }[] | null;
};

function getBrokerName(
  brokers: LoadOffer["brokers"]
): string | null {
  if (!brokers) return null;
  return Array.isArray(brokers) ? brokers[0]?.name : brokers.name;
}

function computeAiScore(load: LoadOffer): number {
  const rpm =
    load.rate && load.miles ? load.rate / load.miles : 0;
  if (rpm >= 5) return 94;
  if (rpm >= 4.5) return 88;
  if (rpm >= 4) return 76;
  if (rpm >= 3.5) return 70;
  return 58;
}

function scoreColor(s: number) {
  if (s >= 90) return "#16C784";
  if (s >= 75) return "#3B82F6";
  if (s >= 60) return "#F59E0B";
  return "#EA3943";
}

function scoreLabel(s: number) {
  if (s >= 90) return "Excellent";
  if (s >= 75) return "Good";
  if (s >= 60) return "Fair";
  return "Poor";
}

function aiReason(load: LoadOffer, score: number): string {
  const rpm =
    load.rate && load.miles
      ? `$${(load.rate / load.miles).toFixed(2)}/mi`
      : "unknown RPM";
  if (score >= 90) return `Premium lane · ${rpm} · Book fast`;
  if (score >= 75) return `Strong rate · ${rpm} · Good broker match`;
  if (score >= 60) return `Average lane · ${rpm} · Review detention window`;
  return `Below-average RPM · Negotiation potential`;
}

function LoadCard({
  load,
  onBook,
}: {
  load: LoadOffer;
  onBook: (load: LoadOffer) => void;
}) {
  const score = computeAiScore(load);
  const sc = scoreColor(score);
  const rpm =
    load.rate && load.miles ? load.rate / load.miles : 0;
  const broker = getBrokerName(load.brokers);

  return (
    <div
      className={`mb-2.5 cursor-pointer rounded-[14px] bg-white px-5 py-5 transition-shadow hover:shadow-lg ${
        score >= 90 ? "border border-brand-green/30" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-[52px] w-[52px] shrink-0 flex-col items-center justify-center rounded-xl"
          style={{ background: sc + "15", border: `2px solid ${sc}30` }}
        >
          <span className="text-base font-extrabold leading-none" style={{ color: sc }}>
            {score}
          </span>
          <span
            className="text-[8px] font-bold uppercase"
            style={{ color: sc }}
          >
            AI
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-base font-bold text-[var(--lp-navy-dark)]">
                  {load.load_number ?? load.id.slice(0, 8)}
                </span>
                {broker && (
                  <span className="text-sm text-[var(--card-muted)]">
                    via {broker}
                  </span>
                )}
                <span
                  className="rounded-md px-1.5 py-0.5 text-[11px] font-bold"
                  style={{ background: sc + "15", color: sc }}
                >
                  {scoreLabel(score)}
                </span>
              </div>
              <p className="text-[13px] text-[var(--card-muted)]">
                {load.miles ? `${load.miles} miles` : "—"} ·{" "}
                {load.commodity ?? "General freight"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[1.4rem] font-extrabold tracking-tight text-[var(--lp-navy-dark)]">
                {formatCurrency(load.rate)}
              </p>
              {rpm > 0 && (
                <p className="text-[13px] font-semibold text-brand-green">
                  ${rpm.toFixed(2)}/mi
                </p>
              )}
            </div>
          </div>

          <div
            className="mb-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
            style={{ background: sc + "0D" }}
          >
            <Zap className="h-3 w-3" style={{ color: sc }} />
            <span className="text-xs text-[var(--lp-navy-dark)]">
              {aiReason(load, score)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--card-muted)]">
              {load.pickup_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  PU {formatDate(load.pickup_date)}
                </span>
              )}
              {broker && (
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {broker}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/loads/${load.id}`}
                className="text-xs font-medium text-accent hover:underline"
              >
                Review
              </Link>
              <button
                onClick={() => onBook(load)}
                className="flex items-center gap-1.5 rounded-[9px] px-4 py-2 text-[13px] font-bold text-white"
                style={{
                  background: score >= 90 ? "#16C784" : "#3B82F6",
                }}
              >
                {score >= 90 ? (
                  <>
                    <Zap className="h-3.5 w-3.5" /> Book Now
                  </>
                ) : (
                  "Book Load"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadOfferCards({ loads }: { loads: LoadOffer[] }) {
  const [sortBy, setSortBy] = useState<"ai" | "rate" | "rpm">("ai");
  const [bookedLoad, setBookedLoad] = useState<LoadOffer | null>(null);

  const sorted = [...loads].sort((a, b) => {
    if (sortBy === "rate") return (b.rate ?? 0) - (a.rate ?? 0);
    if (sortBy === "rpm") {
      const ar = a.rate && a.miles ? a.rate / a.miles : 0;
      const br = b.rate && b.miles ? b.rate / b.miles : 0;
      return br - ar;
    }
    return computeAiScore(b) - computeAiScore(a);
  });

  return (
    <div className="flex min-h-[500px]">
      <aside className="w-60 shrink-0 border-r border-[var(--lp-border)] bg-[var(--lp-navy-mid)] p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--lp-text-secondary)]">
          Sort By
        </p>
        {[
          { key: "ai" as const, label: "AI Score", icon: Zap },
          { key: "rate" as const, label: "Total Rate", icon: DollarSign },
          { key: "rpm" as const, label: "Rate/Mile", icon: TrendingUp },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className={`mb-1 flex w-full items-center gap-2.5 rounded-[9px] px-3.5 py-2.5 text-left text-sm transition-colors ${
              sortBy === s.key
                ? "border border-accent/20 bg-[var(--lp-blue-dim)] font-semibold text-accent"
                : "border border-transparent text-[var(--lp-text-secondary)]"
            }`}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </button>
        ))}

        <div className="mt-5 rounded-xl border border-[var(--lp-border)] bg-[var(--lp-navy-panel)] p-3.5">
          <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">
            <BarChart2 className="h-3 w-3" /> Lane Insights
          </p>
          {[
            { label: "CHI→DET avg", val: "$4.80/mi" },
            { label: "PHX→LA avg", val: "$5.20/mi" },
            { label: "DFW→HOU avg", val: "$3.90/mi" },
          ].map((l) => (
            <div key={l.label} className="mb-2 flex justify-between text-xs">
              <span className="text-[var(--lp-text-tertiary)]">{l.label}</span>
              <span className="font-semibold">{l.val}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[var(--lp-navy-dark)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] text-[var(--lp-text-secondary)]">
            Showing {sorted.length} loads · Sorted by{" "}
            <strong className="text-[var(--lp-text-primary)]">
              {sortBy === "ai"
                ? "AI Score"
                : sortBy === "rate"
                  ? "Total Rate"
                  : "Rate/Mile"}
            </strong>
          </p>
          <button className="flex items-center gap-1.5 rounded-[9px] border border-[var(--lp-border)] bg-[var(--lp-navy-panel)] px-3.5 py-2 text-[13px] text-[var(--lp-text-secondary)]">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {sorted.length ? (
          sorted.map((load) => (
            <LoadCard key={load.id} load={load} onBook={setBookedLoad} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--lp-border)] py-16 text-center">
            <Search className="mx-auto h-8 w-8 text-[var(--lp-text-tertiary)]" />
            <p className="mt-3 text-sm font-medium text-[var(--lp-text-primary)]">
              No loads in queue
            </p>
            <p className="mt-1 text-sm text-[var(--lp-text-secondary)]">
              Parse a broker email or upload a rate con to get started.
            </p>
          </div>
        )}
      </main>

      {bookedLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(6,13,26,0.8)] backdrop-blur-sm">
          <div className="w-[440px] rounded-[20px] border border-[var(--lp-border-bright)] bg-[var(--lp-navy-panel)] p-9 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-brand-green bg-[var(--lp-green-dim)]">
                <CheckCircle className="h-7 w-7 text-brand-green" />
              </div>
              <h2 className="mb-1.5 text-[1.3rem] font-bold">Book this load?</h2>
              <p className="text-sm text-[var(--lp-text-secondary)]">
                {bookedLoad.load_number ?? bookedLoad.id.slice(0, 8)}
                {getBrokerName(bookedLoad.brokers)
                  ? ` · ${getBrokerName(bookedLoad.brokers)}`
                  : ""}
              </p>
            </div>

            <div className="mb-6 rounded-xl bg-[var(--lp-navy-mid)] p-5">
              {[
                { label: "Rate", val: formatCurrency(bookedLoad.rate) },
                {
                  label: "Miles",
                  val: bookedLoad.miles ? String(bookedLoad.miles) : "—",
                },
                {
                  label: "Pickup",
                  val: bookedLoad.pickup_date
                    ? formatDate(bookedLoad.pickup_date)
                    : "—",
                },
                {
                  label: "AI Score",
                  val: String(computeAiScore(bookedLoad)),
                },
              ].map((f) => (
                <div key={f.label} className="mb-3 flex justify-between last:mb-0">
                  <span className="text-sm text-[var(--lp-text-secondary)]">
                    {f.label}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      f.label === "Rate" ? "text-brand-green" : ""
                    }`}
                  >
                    {f.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBookedLoad(null)}
                className="flex-1 rounded-xl border border-[var(--lp-border)] bg-[var(--lp-navy-mid)] py-3 text-sm font-semibold text-[var(--lp-text-secondary)]"
              >
                Cancel
              </button>
              <Link
                href={`/dashboard/loads/${bookedLoad.id}`}
                className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-brand-green py-3 text-sm font-bold text-white"
              >
                <CheckCircle className="h-4 w-4" /> Confirm Booking
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
