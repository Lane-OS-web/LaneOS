"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TruckForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  if (!open) return <Button onClick={() => setOpen(true)}>Add Truck</Button>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    await fetch("/api/trucks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unit_number: form.get("unit_number"),
        vin: form.get("vin"),
        make: form.get("make"),
        model: form.get("model"),
        year: parseInt(form.get("year") as string) || null,
        trailer_type: form.get("trailer_type"),
      }),
    });

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
        <Input name="unit_number" placeholder="Unit #" required />
        <Input name="make" placeholder="Make" />
        <Input name="model" placeholder="Model" />
        <Input name="year" type="number" placeholder="Year" />
        <Input name="trailer_type" placeholder="Trailer type (dry van, reefer...)" />
        <Input name="vin" placeholder="VIN" />
        <div className="flex gap-2 sm:col-span-3">
          <Button type="submit" disabled={loading}>Save Truck</Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
