"use client";

import { useEffect, useState } from "react";
import { Inbox, RefreshCw, Sparkles, Send } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface EmailMessage {
  id: string;
  subject: string;
  sender: string;
  received_at: string;
  auto_processed: boolean;
  direction: string;
  parsed_emails?: {
    parsed_data?: {
      load_number?: string;
      broker_name?: string;
      rate?: number;
      origin?: string;
      destination?: string;
    };
    confidence?: number;
    status?: string;
    load_id?: string;
  };
}

export default function EmailInboxPage() {
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/integrations/email/messages");
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSync() {
    setSyncing(true);
    await fetch("/api/integrations/email/sync", { method: "POST" });
    await load();
    setSyncing(false);
  }

  return (
    <div>
      <PageHeader
        title="Email Inbox"
        description="Auto-scanned broker emails — parsed load data ready for booking"
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/integrations">
              <Button variant="secondary">Manage accounts</Button>
            </Link>
            <Button onClick={handleSync} disabled={syncing}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              />
              Scan for new
            </Button>
          </div>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading inbox...</p>
      ) : messages.length ? (
        <div className="space-y-3">
          {messages.map((msg) => {
            const parsed = msg.parsed_emails?.parsed_data;
            return (
              <Card key={msg.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                      <Inbox className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {msg.subject}
                      </p>
                      <p className="text-xs text-slate-500">
                        {msg.sender} ·{" "}
                        {new Date(msg.received_at).toLocaleString()}
                      </p>
                      {parsed && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {parsed.load_number && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                              {parsed.load_number}
                            </span>
                          )}
                          {parsed.origin && parsed.destination && (
                            <span className="text-slate-500">
                              {parsed.origin} → {parsed.destination}
                            </span>
                          )}
                          {parsed.rate != null && (
                            <span className="font-semibold text-emerald-600">
                              {formatCurrency(parsed.rate)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.auto_processed && (
                      <Badge status="organized" label="AI parsed" />
                    )}
                    {msg.parsed_emails?.status && (
                      <Badge status={msg.parsed_emails.status} />
                    )}
                    {msg.parsed_emails?.load_id && (
                      <Link
                        href={`/dashboard/loads/${msg.parsed_emails.load_id}`}
                      >
                        <Button size="sm" variant="outline">
                          View load
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {msg.auto_processed && parsed && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Confidence{" "}
                    {((msg.parsed_emails?.confidence ?? 0) * 100).toFixed(0)}%
                    — key data extracted automatically
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            No scanned emails yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Connect an email account and run sync to auto-scan broker offers.
          </p>
          <Link href="/dashboard/integrations" className="mt-4 inline-block">
            <Button>Connect email</Button>
          </Link>
        </Card>
      )}

      <Card className="mt-8 border-blue-100 bg-blue-50/30">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-medium text-slate-900">Auto-send</p>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Enable auto-send in integrations to automatically email PODs, detention
          notices, and invoice follow-ups from connected accounts.
        </p>
      </Card>
    </div>
  );
}
