"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Download,
  FolderOpen,
  Zap,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

type DocStatus = "verified" | "pending" | "missing" | "flagged";

type DocumentRow = {
  id: string;
  file_name: string;
  document_type: string;
  scan_status?: string | null;
  scan_confidence?: number | null;
  created_at: string;
  loads?: { load_number?: string | null } | null;
};

function mapDocStatus(doc: DocumentRow): DocStatus {
  if (doc.scan_status === "completed") return "verified";
  if (doc.scan_status === "failed") return "flagged";
  if (!doc.loads?.load_number) return "missing";
  if (doc.scan_status === "processing" || doc.scan_status === "pending")
    return "pending";
  return "verified";
}

const statusMeta: Record<
  DocStatus,
  { label: string; color: string; bg: string; icon: typeof CheckCircle }
> = {
  verified: {
    label: "Verified",
    color: "#16C784",
    bg: "rgba(22,199,132,0.12)",
    icon: CheckCircle,
  },
  pending: {
    label: "Processing",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    icon: Clock,
  },
  missing: {
    label: "Missing",
    color: "#EA3943",
    bg: "rgba(234,57,67,0.12)",
    icon: AlertCircle,
  },
  flagged: {
    label: "Flagged",
    color: "#EA3943",
    bg: "rgba(234,57,67,0.12)",
    icon: AlertCircle,
  },
};

export function DocumentCenterView({ documents }: { documents: DocumentRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocStatus | "all">("all");
  const [selectedDoc, setSelectedDoc] = useState<DocumentRow | null>(null);

  const enriched = documents.map((d) => ({ ...d, uiStatus: mapDocStatus(d) }));

  const filtered = enriched.filter((d) => {
    const matchSearch =
      d.file_name.toLowerCase().includes(search.toLowerCase()) ||
      (d.loads?.load_number ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.uiStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const loadIds = [
    ...new Set(
      documents.map((d) => d.loads?.load_number).filter(Boolean) as string[]
    ),
  ].slice(0, 5);

  const counts = {
    all: documents.length,
    verified: enriched.filter((d) => d.uiStatus === "verified").length,
    pending: enriched.filter((d) => d.uiStatus === "pending").length,
    flagged: enriched.filter((d) => d.uiStatus === "flagged").length,
    missing: enriched.filter((d) => d.uiStatus === "missing").length,
  };

  return (
    <div className="flex min-h-[600px] gap-0 overflow-hidden rounded-2xl border border-[var(--lp-border)]">
      <aside className="w-56 shrink-0 border-r border-[var(--lp-border)] bg-[var(--lp-navy-mid)] p-5">
        <p className="mb-6 text-base font-bold tracking-tight">Document Center</p>

        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--lp-text-secondary)]">
          By Status
        </p>
        {(["all", "verified", "pending", "flagged", "missing"] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] capitalize transition-colors ${
                statusFilter === s
                  ? "border border-accent/20 bg-[var(--lp-blue-dim)] text-accent"
                  : "border border-transparent text-[var(--lp-text-secondary)] hover:bg-white/[0.03]"
              }`}
            >
              {s === "all" ? "All Documents" : s}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  s === "missing" || s === "flagged"
                    ? "bg-[var(--lp-red-dim)] text-destructive"
                    : s === "pending"
                      ? "bg-[var(--lp-amber-dim)] text-amber-500"
                      : "bg-[var(--lp-navy-panel)] text-[var(--lp-text-tertiary)]"
                }`}
              >
                {counts[s]}
              </span>
            </button>
          )
        )}

        {loadIds.length > 0 && (
          <>
            <p className="mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-widest text-[var(--lp-text-secondary)]">
              By Load
            </p>
            {loadIds.map((id) => (
              <button
                key={id}
                onClick={() => setSearch(id)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] text-[var(--lp-text-secondary)] hover:bg-white/[0.03]"
              >
                <FolderOpen className="h-3.5 w-3.5 text-[var(--lp-text-tertiary)]" />
                {id}
              </button>
            ))}
          </>
        )}
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden bg-[var(--lp-navy-dark)]">
        <div className="border-b border-[var(--lp-border)] bg-[var(--lp-navy-mid)] px-7 py-5">
          <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total Documents", val: String(counts.all), color: "#0B1629" },
              {
                label: "AI Verified",
                val: String(counts.verified),
                color: "#16C784",
              },
              {
                label: "Needs Attention",
                val: String(counts.flagged + counts.missing),
                color: "#EA3943",
              },
              { label: "Processing", val: String(counts.pending), color: "#F59E0B" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white px-5 py-4">
                <p className="text-xs text-[var(--card-muted)]">{s.label}</p>
                <p
                  className="text-[1.6rem] font-extrabold tracking-tight"
                  style={{ color: s.color }}
                >
                  {s.val}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex max-w-sm flex-1 items-center gap-2 rounded-[9px] border border-[var(--lp-border)] bg-[var(--lp-navy-dark)] px-3.5 py-2">
              <Search className="h-3.5 w-3.5 text-[var(--lp-text-tertiary)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by load or file name..."
                className="w-full bg-transparent text-[13px] text-[var(--lp-text-primary)] outline-none"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-[9px] border border-[var(--lp-border)] bg-[var(--lp-navy-dark)] px-3.5 py-2 text-[13px] text-[var(--lp-text-secondary)]">
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-7">
          <div className="sticky top-0 grid grid-cols-[1fr_140px_100px_100px_40px] border-b border-[var(--lp-border)] bg-[var(--lp-navy-dark)] py-3">
            {["Document", "Type", "Load", "Status", ""].map((h) => (
              <span
                key={h}
                className="text-[11px] font-semibold uppercase tracking-wider text-[var(--lp-text-tertiary)]"
              >
                {h}
              </span>
            ))}
          </div>

          {filtered.length ? (
            filtered.map((doc, i) => {
              const s = statusMeta[doc.uiStatus];
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`grid cursor-pointer grid-cols-[1fr_140px_100px_100px_40px] items-center py-3.5 transition-colors hover:bg-white/[0.02] ${
                    i < filtered.length - 1
                      ? "border-b border-[var(--lp-border)]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[var(--lp-navy-panel)]">
                      <FileText className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[var(--lp-text-primary)]">
                        {doc.file_name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--lp-text-tertiary)]">
                        <Zap className="h-2.5 w-2.5" />
                        {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--lp-text-secondary)]">
                    {doc.document_type.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-xs font-semibold text-accent">
                    {doc.loads?.load_number ?? "—"}
                  </span>
                  <span
                    className="inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: s.bg, color: s.color }}
                  >
                    <s.icon className="h-2.5 w-2.5" /> {s.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-[var(--lp-text-tertiary)]" />
                    <Download className="h-3.5 w-3.5 text-[var(--lp-text-tertiary)]" />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-12 text-center text-sm text-[var(--lp-text-secondary)]">
              No documents match your filters.
            </p>
          )}
        </div>
      </main>

      {selectedDoc && (
        <aside className="w-80 shrink-0 overflow-y-auto border-l border-[var(--lp-border)] bg-[var(--lp-navy-mid)] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-[15px] font-bold">Document Detail</h3>
            <button
              onClick={() => setSelectedDoc(null)}
              className="rounded-[7px] border border-[var(--lp-border)] bg-[var(--lp-navy-panel)] p-1.5 text-[var(--lp-text-secondary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mb-5 flex h-44 items-center justify-center rounded-xl border border-[var(--lp-border)] bg-[var(--lp-navy-panel)]">
            <FileText className="h-10 w-10 text-[var(--lp-text-tertiary)]" />
          </div>

          {selectedDoc.scan_status && (
            <div className="mb-5 rounded-[10px] border border-accent/20 bg-[var(--lp-blue-dim)] px-3.5 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">
                <Zap className="h-3 w-3" /> AI Analysis
              </p>
              <p className="text-[13px] leading-relaxed text-[var(--lp-text-secondary)]">
                {selectedDoc.scan_status === "completed"
                  ? `Classified as ${selectedDoc.document_type.replace(/_/g, " ")} with ${((selectedDoc.scan_confidence ?? 0) * 100).toFixed(0)}% confidence`
                  : `Scan ${selectedDoc.scan_status}`}
              </p>
            </div>
          )}

          {[
            { label: "Document ID", val: selectedDoc.id.slice(0, 8) },
            {
              label: "Type",
              val: selectedDoc.document_type.replace(/_/g, " "),
            },
            { label: "Load", val: selectedDoc.loads?.load_number ?? "Unlinked" },
            { label: "Uploaded", val: formatDate(selectedDoc.created_at) },
          ].map((f) => (
            <div key={f.label} className="mb-4 flex justify-between">
              <span className="text-[13px] text-[var(--lp-text-tertiary)]">
                {f.label}
              </span>
              <span className="text-[13px] font-medium">{f.val}</span>
            </div>
          ))}

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-accent py-2.5 text-[13px] font-semibold text-white">
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </aside>
      )}
    </div>
  );
}
