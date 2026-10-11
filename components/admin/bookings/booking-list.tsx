import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NeedsActionBadge } from "@/components/admin/bookings/needs-action-badge";
import { StatusBadge } from "@/components/booking/status-badge";
import type { AdminBooking } from "@/lib/api/admin-bookings";
import { formatDateShort, formatPhone, formatTime } from "@/lib/format";

function timeRange(booking: AdminBooking) {
  return `${formatTime(booking.start_at).replace(" WIB", "")}–${formatTime(booking.end_at)}`;
}

function Status({ booking }: { booking: AdminBooking }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <StatusBadge status={booking.status} />
      {booking.needs_action && <NeedsActionBadge />}
    </div>
  );
}

export function BookingList({ bookings }: { bookings: AdminBooking[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 text-xs font-semibold text-neutral-700">
            <tr>
              <th scope="col" className="px-4 py-3">
                Jadwal
              </th>
              <th scope="col" className="px-4 py-3">
                Pasien
              </th>
              <th scope="col" className="px-4 py-3">
                Treatment & terapis
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-neutral-900">{formatDateShort(booking.start_at)}</p>
                  <p className="text-muted-foreground">{timeRange(booking)}</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-neutral-900">{booking.patient_name}</p>
                  <p className="text-muted-foreground">{formatPhone(booking.patient_phone)}</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="text-neutral-900">{booking.treatment_name}</p>
                  <p className="text-muted-foreground">{booking.therapist_name}</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <Status booking={booking} />
                </td>
                <td className="px-4 py-3 text-right align-top">
                  <Link
                    href={`/admin/booking/${booking.id}`}
                    className="inline-flex items-center gap-1 rounded-sm font-semibold text-sage-700 hover:underline"
                  >
                    Detail
                    <span className="sr-only"> booking {booking.code}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <Link
              href={`/admin/booking/${booking.id}`}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-xs"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-neutral-900">{booking.patient_name}</p>
                  <p className="shrink-0 text-sm text-neutral-700">{formatDateShort(booking.start_at)}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {timeRange(booking)} · {booking.treatment_name} · {booking.therapist_name}
                </p>
                <Status booking={booking} />
              </div>
              <ChevronRight aria-hidden="true" strokeWidth={1.75} className="mt-1 size-5 shrink-0 text-neutral-400" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
