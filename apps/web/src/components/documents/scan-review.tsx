"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface ScanReviewProps {
  documentId: string;
  parsed: Record<string, unknown>;
  loadId?: string | null;
}

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "load_number", label: "Load #" },
  { key: "reference_number", label: "Reference #" },
  { key: "broker_name", label: "Broker" },
  { key: "origin", label: "Origin" },
  { key: "destination", label: "Destination" },
  { key: "pickup_date", label: "Pickup date" },
  { key: "delivery_date", label: "Delivery date" },
  { key: "rate", label: "Rate", type: "number" },
  { key: "commodity", label: "Commodity" },
  { key: "weight_lbs", label: "Weight (lbs)", type: "number" },
  { key: "detention_hours", label: "Detention hrs", type: "number" },
  { key: "lumper_amount", label: "Lumper $", type: "number" },
];

export function ScanReview({ documentId, parsed, loadId }: ScanReviewProps) {
  const router = useRouter();
  const [data, setData] = useState(parsed);
  const [saving, setSaving] = useState(false);
  const [linkedLoad, setLinkedLoad] = useState(loadId ?? "");

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parsed_data: data,
        load_id: linkedLoad || null,
        document_type: data.document_type,
      }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <div className="mb-4 flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          Scanned key data
        </CardTitle>
        <Badge status="organized" label="Review & confirm" />
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {field.label}
            </label>
            <Input
              type={field.type ?? "text"}
              value={String(data[field.key] ?? "")}
              onChange={(e) =>
                setData({
                  ...data,
                  [field.key]:
                    field.type === "number"
                      ? e.target.value
                        ? parseFloat(e.target.value)
                        : undefined
                      : e.target.value,
                })
              }
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Link to load ID
          </label>
          <Input
            value={linkedLoad}
            onChange={(e) => setLinkedLoad(e.target.value)}
            placeholder="Optional load UUID"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Confirm key data"}
        </Button>
      </div>
    </Card>
  );
}
