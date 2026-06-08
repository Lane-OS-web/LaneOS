"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DriverForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>Add Driver</Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: form.get("first_name"),
        last_name: form.get("last_name"),
        phone: form.get("phone"),
        email: form.get("email"),
        cdl_number: form.get("cdl_number"),
        cdl_expiry: form.get("cdl_expiry") || null,
      }),
    });

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
        <Input name="first_name" placeholder="First name" required />
        <Input name="last_name" placeholder="Last name" required />
        <Input name="phone" placeholder="Phone" />
        <Input name="email" type="email" placeholder="Email" />
        <Input name="cdl_number" placeholder="CDL Number" />
        <Input name="cdl_expiry" type="date" placeholder="CDL Expiry" />
        <div className="flex gap-2 sm:col-span-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Driver"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
