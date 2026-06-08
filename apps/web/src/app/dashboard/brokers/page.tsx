import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { DataTable, DataRow, DataCell } from "@/components/data-table";
import { fetchBrokers } from "@/lib/data";
import { BrokerForm } from "./broker-form";

export default async function BrokersPage() {
  const brokers = await fetchBrokers();

  return (
    <div>
      <PageHeader
        title="Broker CRM"
        description="Track broker relationships, payment terms, and load history"
      />

      <div className="mb-8">
        <BrokerForm />
      </div>

      <DataTable
        headers={["Broker", "MC #", "Contact", "Payment Terms", "Loads", "Avg Days to Pay"]}
        isEmpty={!brokers.length}
        emptyMessage="No brokers yet. Add your first broker or parse a load email."
      >
        {brokers.map((broker) => (
          <DataRow key={broker.id}>
            <DataCell>
              <Link
                href={`/dashboard/brokers/${broker.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {broker.name}
              </Link>
            </DataCell>
            <DataCell>{broker.mc_number ?? "—"}</DataCell>
            <DataCell>
              <div>
                <p className="text-slate-700">{broker.contact_name ?? "—"}</p>
                {broker.contact_email && (
                  <p className="text-xs text-slate-500">{broker.contact_email}</p>
                )}
              </div>
            </DataCell>
            <DataCell>Net {broker.payment_terms ?? 30}</DataCell>
            <DataCell>{broker.total_loads ?? 0}</DataCell>
            <DataCell>
              {broker.avg_days_to_pay ? `${broker.avg_days_to_pay} days` : "—"}
            </DataCell>
          </DataRow>
        ))}
      </DataTable>
    </div>
  );
}
