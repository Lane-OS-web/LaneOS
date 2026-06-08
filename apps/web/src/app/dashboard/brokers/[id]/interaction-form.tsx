"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function BrokerInteractionForm({ brokerId }: { brokerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    await fetch("/api/brokers/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        broker_id: brokerId,
        interaction_type: form.get("interaction_type"),
        subject: form.get("subject"),
        body: form.get("body"),
      }),
    });

    e.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
      <select
        name="interaction_type"
        className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100"
      >
        <option value="note">Note</option>
        <option value="call">Call</option>
        <option value="email">Email</option>
      </select>
      <Input name="subject" placeholder="Subject" className="flex-1 min-w-[200px]" />
      <Input name="body" placeholder="Details" className="flex-1 min-w-[200px]" />
      <Button type="submit" size="sm" disabled={loading}>Add</Button>
    </form>
  );
}
