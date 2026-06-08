"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function NewLoadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/loads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        load_number: form.get("load_number"),
        reference_number: form.get("reference_number"),
        commodity: form.get("commodity"),
        pickup_date: form.get("pickup_date") || null,
        delivery_date: form.get("delivery_date") || null,
        rate: parseFloat(form.get("rate") as string) || null,
        miles: parseInt(form.get("miles") as string) || null,
        weight_lbs: parseInt(form.get("weight_lbs") as string) || null,
        notes: form.get("notes"),
        status: "booked",
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Failed to create load");
      setLoading(false);
      return;
    }

    const { load } = await res.json();
    router.push(`/dashboard/loads/${load.id}`);
  }

  return (
    <div>
      <PageHeader
        title="New Load"
        description="Manually create a load or use the email parser"
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Load Number
              </label>
              <Input name="load_number" placeholder="LD-12345" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Reference Number
              </label>
              <Input name="reference_number" placeholder="REF-98765" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Pickup Date
              </label>
              <Input name="pickup_date" type="datetime-local" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Delivery Date
              </label>
              <Input name="delivery_date" type="datetime-local" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Rate ($)
              </label>
              <Input name="rate" type="number" step="0.01" placeholder="2500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Miles
              </label>
              <Input name="miles" type="number" placeholder="850" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Weight (lbs)
              </label>
              <Input name="weight_lbs" type="number" placeholder="42000" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Commodity
            </label>
            <Input name="commodity" placeholder="General freight" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              className="flex w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              placeholder="Special instructions..."
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Load"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
