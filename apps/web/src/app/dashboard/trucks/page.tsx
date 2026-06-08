import { PageHeader } from "@/components/page-header";
import { DataTable, DataRow, DataCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { fetchTrucks } from "@/lib/data";
import { TruckForm } from "./truck-form";

export default async function TrucksPage() {
  const trucks = await fetchTrucks();

  return (
    <div>
      <PageHeader title="Trucks" description="Manage your fleet equipment" />

      <div className="mb-8">
        <TruckForm />
      </div>

      <DataTable
        headers={["Unit #", "Make/Model", "Year", "Trailer Type", "VIN", "Status"]}
        isEmpty={!trucks.length}
      >
        {trucks.map((truck) => (
          <DataRow key={truck.id}>
            <DataCell className="font-medium text-slate-900">
              {truck.unit_number}
            </DataCell>
            <DataCell>
              {[truck.make, truck.model].filter(Boolean).join(" ") || "—"}
            </DataCell>
            <DataCell>{truck.year ?? "—"}</DataCell>
            <DataCell>{truck.trailer_type ?? "—"}</DataCell>
            <DataCell className="font-mono text-xs">{truck.vin ?? "—"}</DataCell>
            <DataCell>
              <Badge status={truck.status} label={truck.status} />
            </DataCell>
          </DataRow>
        ))}
      </DataTable>
    </div>
  );
}
