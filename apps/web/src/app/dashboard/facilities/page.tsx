import { PageHeader } from "@/components/page-header";
import { DataTable, DataRow, DataCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { fetchFacilities } from "@/lib/data";
import { FacilityForm } from "./facility-form";

export default async function FacilitiesPage() {
  const facilities = await fetchFacilities();

  return (
    <div>
      <PageHeader
        title="Facilities"
        description="Shipper and receiver database with dock intel"
      />

      <div className="mb-8">
        <FacilityForm />
      </div>

      <DataTable
        headers={["Name", "Type", "Location", "Dock Hours", "Avg Wait", "Appt Required"]}
        isEmpty={!facilities.length}
        emptyMessage="No facilities yet. Add shippers and receivers you visit regularly."
      >
        {facilities.map((facility) => (
          <DataRow key={facility.id}>
            <DataCell className="font-medium text-slate-900">
              {facility.name}
            </DataCell>
            <DataCell>
              <Badge status={facility.facility_type} label={facility.facility_type} />
            </DataCell>
            <DataCell>
              {facility.city}, {facility.state} {facility.zip}
            </DataCell>
            <DataCell>{facility.dock_hours ?? "—"}</DataCell>
            <DataCell>
              {facility.avg_wait_minutes
                ? `${facility.avg_wait_minutes} min`
                : "—"}
            </DataCell>
            <DataCell>{facility.appointment_required ? "Yes" : "No"}</DataCell>
          </DataRow>
        ))}
      </DataTable>
    </div>
  );
}
