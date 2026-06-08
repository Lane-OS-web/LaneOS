import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { DataTable, DataRow, DataCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { fetchLoads } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

function getBrokerName(
  brokers: { name: string } | { name: string }[] | null | undefined
) {
  if (!brokers) return null;
  return Array.isArray(brokers) ? brokers[0]?.name : brokers.name;
}

function getDriverName(
  drivers: { first_name: string; last_name: string } | null | undefined
) {
  if (!drivers) return null;
  return `${drivers.first_name} ${drivers.last_name}`;
}

export default async function LoadsPage() {
  const loads = await fetchLoads();

  return (
    <div>
      <PageHeader
        title="Active Loads"
        description="Track and manage all freight loads across your fleet"
        actionLabel="New Load"
        actionHref="/dashboard/loads/new"
      />

      <DataTable
        headers={["Load #", "Broker", "Driver", "Pickup", "Rate", "Status"]}
        isEmpty={!loads.length}
        emptyMessage="No loads yet. Book your first load from the Load Booking Center."
      >
        {loads.map((load) => (
          <DataRow key={load.id}>
            <DataCell>
              <Link
                href={`/dashboard/loads/${load.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {load.load_number ?? load.id.slice(0, 8)}
              </Link>
            </DataCell>
            <DataCell>{getBrokerName(load.brokers) ?? "—"}</DataCell>
            <DataCell>{getDriverName(load.drivers) ?? "—"}</DataCell>
            <DataCell>{formatDate(load.pickup_date)}</DataCell>
            <DataCell className="font-semibold text-emerald-600">
              {formatCurrency(load.rate)}
            </DataCell>
            <DataCell>
              <Badge status={load.status} />
            </DataCell>
          </DataRow>
        ))}
      </DataTable>
    </div>
  );
}
