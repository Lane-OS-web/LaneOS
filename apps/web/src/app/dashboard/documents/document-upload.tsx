"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Sparkles, ScanLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanReview } from "@/components/documents/scan-review";

interface ScanResult {
  status: string;
  parsed: Record<string, unknown>;
  matched_load_id?: string | null;
}

export function DocumentUpload() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [scanResult, setScanResult] = useState<{
    documentId: string;
    scan: ScanResult;
  } | null>(null);

  if (!open && !scanResult) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white px-6 py-10 text-center transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
          <ScanLine className="h-5 w-5 text-slate-500" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-slate-900">
            Scan &amp; upload document
          </p>
          <p className="text-xs text-slate-500">
            AI extracts key data — rate, load #, dates, detention, lumper
          </p>
        </div>
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const file = form.get("file") as File;

    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("document_type", form.get("document_type") as string);
    uploadData.append("load_id", (form.get("load_id") as string) || "");
    uploadData.append("auto_scan", "true");

    const res = await fetch("/api/documents", { method: "POST", body: uploadData });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error ?? "Upload failed");
      setLoading(false);
      return;
    }

    setOpen(false);
    setLoading(false);

    if (data.scan?.parsed) {
      setScanResult({
        documentId: data.document.id,
        scan: data.scan,
      });
    } else {
      router.refresh();
    }
  }

  if (scanResult) {
    return (
      <div className="space-y-4">
        <ScanReview
          documentId={scanResult.documentId}
          parsed={scanResult.scan.parsed}
          loadId={scanResult.scan.matched_load_id}
        />
        <Button
          variant="outline"
          onClick={() => {
            setScanResult(null);
            router.refresh();
          }}
        >
          Done
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-600" />
        <p className="text-sm font-medium text-slate-900">
          Scan, classify &amp; extract key data
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div
          className={`mb-4 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
            dragOver
              ? "border-blue-300 bg-blue-50"
              : "border-slate-200 bg-slate-50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
        >
          <Upload className="mx-auto mb-2 h-6 w-6 text-slate-400" />
          <Input
            name="file"
            type="file"
            required
            accept="image/*,.pdf,.txt"
            className="border-0 bg-transparent text-center file:mx-auto file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700"
          />
          <p className="mt-2 text-xs text-slate-400">
            PDF, photo, or image — OCR + AI field extraction
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <select
            name="document_type"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            defaultValue="other"
          >
            <option value="other">Auto-detect type</option>
            <option value="rate_confirmation">Rate Confirmation</option>
            <option value="bol">BOL</option>
            <option value="pod">POD</option>
            <option value="invoice">Invoice</option>
            <option value="lumper_receipt">Lumper Receipt</option>
            <option value="detention_form">Detention Form</option>
          </select>
          <Input name="load_id" placeholder="Load ID (optional)" />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Scanning..." : "Scan & upload"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
