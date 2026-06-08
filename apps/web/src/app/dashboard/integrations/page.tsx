"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  RefreshCw,
  Link2,
  Unlink,
  Send,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Integration {
  id: string;
  provider: "gmail" | "outlook";
  email_address: string;
  auto_scan: boolean;
  auto_send: boolean;
  status: string;
  last_sync_at?: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/integrations/email");
    const data = await res.json();
    setIntegrations(data.integrations ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    setConnected(params.get("connected"));
    setOauthError(params.get("error"));
  }, []);

  async function handleSync() {
    setSyncing(true);
    await fetch("/api/integrations/email/sync", { method: "POST" });
    await load();
    setSyncing(false);
  }

  async function toggleSetting(
    id: string,
    field: "auto_scan" | "auto_send",
    value: boolean
  ) {
    await fetch("/api/integrations/email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Email Integrations"
        description="Connect Gmail or Outlook — auto-scan broker emails and send PODs, detention notices, and invoices"
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/email-inbox">
              <Button variant="secondary">
                <Inbox className="mr-2 h-4 w-4" />
                Inbox
              </Button>
            </Link>
            <Button onClick={handleSync} disabled={syncing}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              />
              Sync now
            </Button>
          </div>
        }
      />

      {connected && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          {connected} account connected successfully.
        </div>
      )}

      {oauthError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Connection failed: {oauthError.replace(/_/g, " ")}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900">Connect Gmail</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-slate-500">
            Auto-scan load offers and rate confirmations from your inbox.
            Auto-send PODs and detention claims.
          </p>
          <a href="/api/integrations/email/connect?provider=gmail">
            <Button>
              <Link2 className="mr-2 h-4 w-4" />
              Connect Gmail
            </Button>
          </a>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900">Connect Outlook</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-slate-500">
            Microsoft 365 / Outlook integration with the same auto-scan and
            auto-send workflows.
          </p>
          <a href="/api/integrations/email/connect?provider=outlook">
            <Button variant="secondary">
              <Link2 className="mr-2 h-4 w-4" />
              Connect Outlook
            </Button>
          </a>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Connected accounts</CardTitle>
        </CardHeader>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : integrations.length ? (
          <div className="space-y-4">
            {integrations.map((int) => (
              <div
                key={int.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <Mail className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {int.email_address}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {int.provider} · Last sync{" "}
                      {int.last_sync_at
                        ? new Date(int.last_sync_at).toLocaleString()
                        : "never"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={int.auto_scan}
                      onChange={(e) =>
                        toggleSetting(int.id, "auto_scan", e.target.checked)
                      }
                    />
                    Auto-scan
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={int.auto_send}
                      onChange={(e) =>
                        toggleSetting(int.id, "auto_send", e.target.checked)
                      }
                    />
                    Auto-send
                  </label>
                  <Badge status={int.status === "active" ? "delivered" : "draft"} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No email accounts connected. Connect Gmail or Outlook above.
          </p>
        )}
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Send className="h-4 w-4" />
            Auto-send templates
          </CardTitle>
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              type: "pod_submission",
              title: "POD submission",
              desc: "Send proof of delivery to broker on delivery",
            },
            {
              type: "detention_notice",
              title: "Detention notice",
              desc: "Notify broker of billable detention hours",
            },
            {
              type: "invoice_followup",
              title: "Invoice follow-up",
              desc: "Chase payment on delivered loads",
            },
          ].map((t) => (
            <div
              key={t.type}
              className="rounded-lg border border-slate-100 p-4"
            >
              <p className="font-medium text-slate-900">{t.title}</p>
              <p className="mt-1 text-xs text-slate-500">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
