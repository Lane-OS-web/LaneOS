import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { fetchBrokerById, fetchBrokerInteractions, fetchLoads } from "@/lib/data";
import { isDemoMode } from "@/lib/demo";
import { formatDate } from "@/lib/utils";
import { BrokerInteractionForm } from "./interaction-form";

const demoInteractions = [
  {
    id: "int-1",
    interaction_type: "email",
    subject: "Load offer — Dallas to Atlanta",
    body: "Sent rate confirmation for LP-2401",
    created_at: "2026-06-06T10:00:00Z",
  },
  {
    id: "int-2",
    interaction_type: "call",
    subject: "Detention claim follow-up",
    body: "Confirmed $225 detention will be added to settlement",
    created_at: "2026-06-08T14:30:00Z",
  },
];

export default async function BrokerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const broker = await fetchBrokerById(id);

  if (!broker) notFound();

  const allLoads = await fetchLoads();
  const loads = allLoads
    .filter((l) => {
      const name =
        typeof l.brokers === "object" && l.brokers && "name" in l.brokers
          ? l.brokers.name
          : null;
      return name === broker.name;
    })
    .slice(0, 10);

  const interactions = isDemoMode()
    ? demoInteractions
    : await fetchBrokerInteractions(id);

  return (
    <div>
      <PageHeader title={broker.name} description={`MC ${broker.mc_number ?? "N/A"}`} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4 text-slate-900">Contact Info</CardTitle>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Contact", broker.contact_name],
              ["Email", broker.contact_email],
              ["Phone", broker.contact_phone],
              ["Payment Terms", `Net ${broker.payment_terms}`],
              ["Credit Rating", broker.credit_rating],
              ["Total Loads", broker.total_loads],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="text-sm text-slate-900">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
          {broker.notes && (
            <p className="mt-4 text-sm text-slate-600">{broker.notes}</p>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4 text-slate-900">Recent Loads</CardTitle>
          {loads.length ? (
            <ul className="space-y-2">
              {loads.map((load) => (
                <li key={load.id} className="text-sm text-slate-700">
                  {load.load_number ?? load.id.slice(0, 8)} —{" "}
                  {load.rate != null ? `$${load.rate.toLocaleString()}` : "—"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No loads with this broker</p>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <CardTitle className="mb-4 text-slate-900">Interactions</CardTitle>
        <BrokerInteractionForm brokerId={id} />
        <div className="mt-4 space-y-3">
          {interactions.map((i) => (
            <div
              key={i.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize text-slate-700">
                  {i.interaction_type}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDate(i.created_at)}
                </span>
              </div>
              {i.subject && (
                <p className="mt-1 text-sm text-slate-900">{i.subject}</p>
              )}
              {i.body && (
                <p className="mt-1 text-sm text-slate-600">{i.body}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
