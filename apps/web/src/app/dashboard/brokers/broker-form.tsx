"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function BrokerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  if (!open) return <Button onClick={() => setOpen(true)}>Add Broker</Button>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    await fetch("/api/brokers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        mc_number: form.get("mc_number"),
        contact_name: form.get("contact_name"),
        contact_email: form.get("contact_email"),
        contact_phone: form.get("contact_phone"),
        payment_terms: parseInt(form.get("payment_terms") as string) || 30,
        notes: form.get("notes"),
      }),
    });

    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
        <Input name="name" placeholder="Broker name" required />
        <Input name="mc_number" placeholder="MC Number" />
        <Input name="contact_name" placeholder="Contact name" />
        <Input name="contact_email" type="email" placeholder="Contact email" />
        <Input name="contact_phone" placeholder="Contact phone" />
        <Input name="payment_terms" type="number" placeholder="Payment terms (days)" defaultValue={30} />
        <Input name="notes" placeholder="Notes" className="sm:col-span-3" />
        <div className="flex gap-2 sm:col-span-3">
          <Button type="submit" disabled={loading}>Save Broker</Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
