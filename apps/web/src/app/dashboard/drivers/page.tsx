import { PageHeader } from "@/components/page-header";
import { DataTable, DataRow, DataCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { fetchDrivers } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { DriverForm } from "./driver-form";

export default async function DriversPage() {
  const drivers = await fetchDrivers();

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="Manage your driver roster"
      />

      <div className="mb-8">
        <DriverForm />
      </div>

      <DataTable
        headers={["Name", "Phone", "CDL", "CDL Expiry", "Status"]}
        isEmpty={!drivers.length}
      >
        {drivers.map((driver) => (
          <DataRow key={driver.id}>
            <DataCell className="font-medium text-slate-900">
              {driver.first_name} {driver.last_name}
            </DataCell>
            <DataCell>{driver.phone ?? "—"}</DataCell>
            <DataCell>{driver.cdl_number ?? "—"}</DataCell>
            <DataCell>{formatDate(driver.cdl_expiry)}</DataCell>
            <DataCell>
              <Badge status={driver.status} label={driver.status} />
            </DataCell>
          </DataRow>
        ))}
      </DataTable>
    </div>
  );
}
