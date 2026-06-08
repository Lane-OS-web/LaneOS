"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles } from "lucide-react";

interface ParsedResult {
  load_number?: string;
  broker_name?: string;
  origin?: string;
  destination?: string;
  pickup_date?: string;
  delivery_date?: string;
  rate?: number;
  commodity?: string;
  weight_lbs?: number;
  confidence?: number;
}

export default function EmailParserPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function handleParse() {
    setLoading(true);
    const res = await fetch("/api/ai/parse-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setParsed(data.parsed);
    setLoading(false);
  }

  async function handleCreateLoad() {
    if (!parsed) return;
    setCreating(true);

    const res = await fetch("/api/ai/create-load-from-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, parsed }),
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
        title="AI Email Parser"
        description="Paste broker load offers — AI extracts load details automatically"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-amber-400" />
            Paste Email
          </CardTitle>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Subject
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Load offer: Dallas TX to Atlanta GA - $2,800"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Email Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                placeholder="Paste the full broker email here..."
              />
            </div>
            <Button onClick={handleParse} disabled={loading || !body}>
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Parsing..." : "Parse with AI"}
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-4">Extracted Data</CardTitle>
          {parsed ? (
            <div>
              <dl className="space-y-3">
                {Object.entries(parsed)
                  .filter(([key]) => key !== "confidence")
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <dt className="capitalize text-slate-500">
                        {key.replace(/_/g, " ")}
                      </dt>
                      <dd className="text-slate-200">
                        {value != null ? String(value) : "—"}
                      </dd>
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
                {creating ? "Creating load..." : "Create Load from Email"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Parse an email to see extracted load details here.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
