"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LoadOption {
  id: string;
  load_number?: string;
  status: string;
}

interface Claim {
  claim_type: string;
  amount: number;
  description: string;
  detention_hours?: number;
}

export function RevenueAnalyzer() {
  const router = useRouter();
  const [loads, setLoads] = useState<LoadOption[]>([]);
  const [loadId, setLoadId] = useState("");
  const [notes, setNotes] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/loads")
      .then((r) => r.json())
      .then((d) => setLoads(d.loads ?? []));
  }, []);

  async function handleAnalyze() {
    if (!loadId) return;
    setLoading(true);

    const res = await fetch("/api/ai/analyze-revenue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loadId, notes }),
    });

    const data = await res.json();
    setClaims(data.analysis?.claims ?? []);
    setTotal(data.analysis?.total_recoverable ?? 0);
    setLoading(false);
  }

  async function handleSaveClaims() {
    if (!claims.length) return;
    setSaving(true);

    await fetch("/api/revenue-claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loadId, claims }),
    });

    setSaving(false);
    setClaims([]);
    setTotal(0);
    router.refresh();
  }

  return (
    <Card>
      <CardTitle className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-400" />
        Analyze Load for Missed Revenue
      </CardTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <select
          value={loadId}
          onChange={(e) => setLoadId(e.target.value)}
          className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100"
        >
          <option value="">Select a load...</option>
          {loads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.load_number ?? l.id.slice(0, 8)} ({l.status})
            </option>
          ))}
        </select>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Additional notes: detention hours, lumper fees, etc."
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 sm:col-span-2"
        />
      </div>
      <div className="mt-4 flex gap-3">
        <Button onClick={handleAnalyze} disabled={loading || !loadId}>
          {loading ? "Analyzing..." : "Run Analysis"}
        </Button>
        {claims.length > 0 && (
          <Button onClick={handleSaveClaims} disabled={saving} variant="secondary">
            {saving ? "Saving..." : `Save ${claims.length} Claims (${formatCurrency(total)})`}
          </Button>
        )}
      </div>
      {claims.length > 0 && (
        <ul className="mt-4 space-y-2">
          {claims.map((c, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-slate-800 p-3 text-sm"
            >
              <div>
                <span className="capitalize font-medium text-slate-200">
                  {c.claim_type.replace(/_/g, " ")}
                </span>
                <p className="text-slate-500">{c.description}</p>
              </div>
              <span className="text-emerald-400">{formatCurrency(c.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
