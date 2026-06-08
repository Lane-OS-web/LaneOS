import { PageHeader } from "@/components/page-header";
import { DataTable, DataRow, DataCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { fetchClaims } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RevenueAnalyzer } from "./revenue-analyzer";

export default async function RevenuePage() {
  const claims = await fetchClaims();

  const totalRecoverable = claims
    .filter((c) => ["draft", "submitted"].includes(c.status))
    .reduce((sum, c) => sum + c.amount, 0);

  const totalRecovered = claims
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div>
      <PageHeader
        title="Revenue Recovery"
        description="Catch detention, lumper, TONU, and accessorial charges automatically"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle className="text-sm text-slate-500">Recoverable</CardTitle>
          <p className="mt-2 text-3xl font-semibold text-amber-600">
            {formatCurrency(totalRecoverable)}
          </p>
        </Card>
        <Card>
          <CardTitle className="text-sm text-slate-500">Recovered (Paid)</CardTitle>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {formatCurrency(totalRecovered)}
          </p>
        </Card>
      </div>

      <div className="mb-8">
        <RevenueAnalyzer />
      </div>

      <DataTable
        headers={["Load", "Type", "Amount", "Status", "Created"]}
        isEmpty={!claims.length}
        emptyMessage="No claims yet. Run the analyzer on a delivered load."
      >
        {claims.map((claim) => (
          <DataRow key={claim.id}>
            <DataCell>
              {claim.loads?.load_number ?? claim.load_id.slice(0, 8)}
            </DataCell>
            <DataCell className="capitalize">
              {claim.claim_type.replace(/_/g, " ")}
            </DataCell>
            <DataCell className="font-semibold text-emerald-600">
              {formatCurrency(claim.amount)}
            </DataCell>
            <DataCell>
              <Badge status={claim.status} />
            </DataCell>
            <DataCell>{formatDate(claim.created_at)}</DataCell>
          </DataRow>
        ))}
      </DataTable>
    </div>
  );
}
