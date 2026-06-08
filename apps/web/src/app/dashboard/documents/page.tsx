import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DocumentCenterView } from "@/components/documents/document-center-view";
import { fetchDocuments } from "@/lib/data";
import { DocumentUpload } from "./document-upload";

export default async function DocumentsPage() {
  const documents = await fetchDocuments();

  return (
    <div>
      <PageHeader
        title="Document Center"
        description="AI-organized BOLs, PODs, rate confirmations, and accessorial docs"
      />

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-brand-green/30 bg-[var(--lp-green-dim)] px-4 py-3">
        <Sparkles className="h-4 w-4 text-brand-green" />
        <p className="text-sm text-[var(--lp-text-secondary)]">
          <span className="font-medium text-brand-green">AI classification active</span>
          {" — "}
          Upload any freight document and LaneOS tags the type, extracts key
          fields, and links it to the matching load.
        </p>
      </div>

      <div className="mb-6">
        <DocumentUpload />
      </div>

      <DocumentCenterView documents={documents} />
    </div>
  );
}
