import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AdminPatient } from "@/lib/api/admin-patients";
import { formatDateShort, formatPhone } from "@/lib/format";

function lastVisit(patient: AdminPatient) {
  return patient.last_visit_at ? formatDateShort(patient.last_visit_at) : "Belum pernah";
}

export function PatientList({ patients }: { patients: AdminPatient[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 text-xs font-semibold text-neutral-700">
            <tr>
              <th scope="col" className="px-4 py-3">
                Pasien
              </th>
              <th scope="col" className="px-4 py-3">
                Email
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Booking
              </th>
              <th scope="col" className="px-4 py-3">
                Kunjungan terakhir
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-neutral-900">{patient.name}</p>
                  <p className="text-muted-foreground">{formatPhone(patient.phone)}</p>
                </td>
                <td className="max-w-56 px-4 py-3 align-top break-words text-neutral-700">{patient.email || "—"}</td>
                <td className="px-4 py-3 text-right align-top text-neutral-900 tabular-nums">
                  {patient.booking_count}
                </td>
                <td className="px-4 py-3 align-top text-neutral-700">{lastVisit(patient)}</td>
                <td className="px-4 py-3 text-right align-top">
                  <Link
                    href={`/admin/pasien/${patient.id}`}
                    className="inline-flex items-center gap-1 rounded-sm font-semibold text-sage-700 hover:underline"
                  >
                    Detail
                    <span className="sr-only"> {patient.name}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {patients.map((patient) => (
          <li key={patient.id}>
            <Link
              href={`/admin/pasien/${patient.id}`}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-xs"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold text-neutral-900">{patient.name}</p>
                <p className="text-sm text-muted-foreground">{formatPhone(patient.phone)}</p>
                <p className="text-sm text-neutral-700">
                  {patient.booking_count} booking · Terakhir: {lastVisit(patient)}
                </p>
              </div>
              <ChevronRight aria-hidden="true" strokeWidth={1.75} className="mt-1 size-5 shrink-0 text-neutral-400" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
