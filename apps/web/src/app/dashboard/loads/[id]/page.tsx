import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchLoadById,
  fetchLoadClaims,
  fetchLoadDocuments,
} from "@/lib/data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

function getBrokerName(
  brokers: { name: string; contact_email?: string } | null | undefined
) {
  return brokers?.name ?? null;
}

export default async function LoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const load = await fetchLoadById(id);

  if (!load) notFound();

  const documents = await fetchLoadDocuments(id);
  const claims = await fetchLoadClaims(id);

  return (
    <div>
      <PageHeader
        title={load.load_number ?? `Load ${id.slice(0, 8)}`}
        description={load.commodity ?? "Freight load"}
        action={
          <div className="flex items-center gap-3">
            <Badge status={load.status} />
            <Link href="/dashboard/revenue">
              <Button variant="secondary" size="sm">
                Analyze Revenue
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4 text-slate-900">Load Details</CardTitle>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Reference", load.reference_number],
              ["Broker", getBrokerName(load.brokers)],
              [
                "Driver",
                load.drivers
                  ? `${load.drivers.first_name} ${load.drivers.last_name}`
                  : null,
              ],
              ["Truck", load.trucks?.unit_number],
              ["Pickup", formatDateTime(load.pickup_date)],
              ["Delivery", formatDateTime(load.delivery_date)],
              ["Rate", formatCurrency(load.rate)],
              ["Miles", load.miles?.toLocaleString()],
              [
                "Weight",
                load.weight_lbs ? `${load.weight_lbs.toLocaleString()} lbs` : null,
              ],
              [
                "Rate/Mile",
                load.rate_per_mile ? `$${load.rate_per_mile.toFixed(2)}` : null,
              ],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-0.5 text-sm text-slate-900">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
          {load.notes && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">Notes</p>
              <p className="mt-1 text-sm text-slate-700">{load.notes}</p>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-4 text-slate-900">Documents</CardTitle>
            {documents.length ? (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-700">{doc.file_name}</span>
                    <Badge
                      status={doc.document_type}
                      label={doc.document_type.replace(/_/g, " ")}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No documents attached</p>
            )}
            <Link href="/dashboard/documents" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                Upload Document
              </Button>
            </Link>
          </Card>

          <Card>
            <CardTitle className="mb-4 text-slate-900">Revenue Claims</CardTitle>
            {claims.length ? (
              <ul className="space-y-2">
                {claims.map((claim) => (
                  <li
                    key={claim.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize text-slate-700">
                      {claim.claim_type.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-emerald-600">
                        {formatCurrency(claim.amount)}
                      </span>
                      <Badge status={claim.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No claims filed</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
