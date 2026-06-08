"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ParsedRC {
  broker_name?: string;
  load_number?: string;
  reference_number?: string;
  pickup_address?: string;
  delivery_address?: string;
  pickup_date?: string;
  delivery_date?: string;
  rate?: number;
  fuel_surcharge?: number;
  commodity?: string;
  weight_lbs?: number;
  miles?: number;
  detention_policy?: string;
  payment_terms?: number;
  confidence?: number;
}

export default function RateConfirmationPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedRC | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function handleParse() {
    setLoading(true);
    const res = await fetch("/api/ai/parse-rate-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setParsed(data.parsed);
    setLoading(false);
  }

  async function handleCreateLoad() {
    if (!parsed) return;
    setCreating(true);

    const res = await fetch("/api/ai/create-load-from-rc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parsed, rawText: text }),
    });

    const data = await res.json();
    setCreating(false);

    if (data.load?.id) {
      router.push(`/dashboard/loads/${data.load.id}`);
    }
  }

  return (
    <div>
      <PageHeader
        title="Rate Confirmation Parser"
        description="Paste or upload rate con text — AI extracts every field"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-amber-400" />
            Rate Confirmation Text
          </CardTitle>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={16}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            placeholder="Paste rate confirmation text here, or upload a document and paste extracted text..."
          />
          <Button
            className="mt-4"
            onClick={handleParse}
            disabled={loading || !text}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Parsing..." : "Parse Rate Con"}
          </Button>
        </Card>

        <Card>
          <CardTitle className="mb-4">Parsed Fields</CardTitle>
          {parsed ? (
            <div>
              <dl className="space-y-3">
                {[
                  ["Broker", parsed.broker_name],
                  ["Load #", parsed.load_number],
                  ["Reference", parsed.reference_number],
                  ["Pickup", parsed.pickup_address],
                  ["Delivery", parsed.delivery_address],
                  ["Pickup Date", parsed.pickup_date],
                  ["Delivery Date", parsed.delivery_date],
                  ["Rate", parsed.rate != null ? formatCurrency(parsed.rate) : null],
                  ["Fuel Surcharge", parsed.fuel_surcharge != null ? formatCurrency(parsed.fuel_surcharge) : null],
                  ["Commodity", parsed.commodity],
                  ["Weight", parsed.weight_lbs ? `${parsed.weight_lbs.toLocaleString()} lbs` : null],
                  ["Miles", parsed.miles],
                  ["Detention Policy", parsed.detention_policy],
                  ["Payment Terms", parsed.payment_terms ? `Net ${parsed.payment_terms}` : null],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right text-slate-200">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
              {parsed.confidence != null && (
                <p className="mt-4 text-xs text-slate-500">
                  Confidence: {(parsed.confidence * 100).toFixed(0)}%
                </p>
              )}
              <Button
                className="mt-6 w-full"
                onClick={handleCreateLoad}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Load from Rate Con"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Parse a rate confirmation to see extracted fields.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
