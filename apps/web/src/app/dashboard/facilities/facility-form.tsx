"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FacilityForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  if (!open) return <Button onClick={() => setOpen(true)}>Add Facility</Button>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    await fetch("/api/facilities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        facility_type: form.get("facility_type"),
        address_line1: form.get("address_line1"),
        city: form.get("city"),
        state: form.get("state"),
        zip: form.get("zip"),
        dock_hours: form.get("dock_hours"),
        appointment_required: form.get("appointment_required") === "on",
        lumper_required: form.get("lumper_required") === "on",
        detention_policy: form.get("detention_policy"),
        notes: form.get("notes"),
        avg_wait_minutes: parseInt(form.get("avg_wait_minutes") as string) || null,
      }),
    });

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
        <Input name="name" placeholder="Facility name" required className="sm:col-span-2" />
        <select
          name="facility_type"
          className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100"
        >
          <option value="shipper">Shipper</option>
          <option value="receiver">Receiver</option>
          <option value="both">Both</option>
        </select>
        <Input name="address_line1" placeholder="Address" required className="sm:col-span-3" />
        <Input name="city" placeholder="City" required />
        <Input name="state" placeholder="State" required />
        <Input name="zip" placeholder="ZIP" required />
        <Input name="dock_hours" placeholder="Dock hours (e.g. 6am-4pm)" />
        <Input name="avg_wait_minutes" type="number" placeholder="Avg wait (min)" />
        <Input name="detention_policy" placeholder="Detention policy" />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="appointment_required" /> Appointment required
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="lumper_required" /> Lumper required
        </label>
        <Input name="notes" placeholder="Notes" className="sm:col-span-3" />
        <div className="flex gap-2 sm:col-span-3">
          <Button type="submit" disabled={loading}>Save Facility</Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
