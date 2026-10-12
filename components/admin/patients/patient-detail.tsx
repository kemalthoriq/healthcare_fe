"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarSearch, ChevronRight, SearchX } from "lucide-react";
import { SectionCard } from "@/components/admin/section-card";
import { StatusBadge } from "@/components/booking/status-badge";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPatientKey, fetchAdminPatient, type PatientBooking } from "@/lib/api/admin-patients";
import { isApiError } from "@/lib/api/client";
import { formatDateShort, formatPhone, formatRupiah, formatTime } from "@/lib/format";

function schedule(booking: PatientBooking) {
  return `${formatDateShort(booking.start_at)}, ${formatTime(booking.start_at).replace(" WIB", "")}–${formatTime(booking.end_at)}`;
}

function BookingHistory({ bookings }: { bookings: PatientBooking[] }) {
  if (bookings.length === 0) {
    return (
      <EmptyState icon={CalendarSearch} title="Belum ada booking" description="Pasien ini belum memiliki booking." />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {bookings.map((booking) => (
        <li key={booking.id}>
          <Link
            href={`/admin/booking/${booking.id}`}
            className="-mx-2 flex items-start gap-3 rounded-md px-2 py-4 hover:bg-neutral-50"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-medium text-neutral-900">{schedule(booking)}</p>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {booking.treatment_name} · {booking.therapist_name} · {formatRupiah(booking.price)}
              </p>
              <p className="font-mono text-xs tracking-wider text-neutral-500">{booking.code}</p>
              {booking.treatment_note && (
                <p className="rounded-md bg-neutral-100 px-3 py-2 text-sm whitespace-pre-line text-neutral-900">
                  {booking.treatment_note}
                </p>
              )}
            </div>
            <ChevronRight aria-hidden="true" strokeWidth={1.75} className="mt-1 size-5 shrink-0 text-neutral-400" />
            <span className="sr-only">Detail booking {booking.code}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat pasien">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  );
}

export function PatientDetail({ id }: { id: number }) {
  const query = useQuery({ queryKey: adminPatientKey(id), queryFn: () => fetchAdminPatient(id) });

  const backLink = (
    <Link
      href="/admin/pasien"
      className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-neutral-700 hover:text-sage-700"
    >
      <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
      Daftar pasien
    </Link>
  );

  if (query.isPending) {
    return <DetailSkeleton />;
  }

  if (query.error) {
    return (
      <div className="space-y-6">
        {backLink}
        {isApiError(query.error) && query.error.status === 404 ? (
          <EmptyState icon={SearchX} title="Pasien tidak ditemukan" description="Data pasien ini tidak ada." />
        ) : (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        )}
      </div>
    );
  }

  const patient = query.data;
  const rows = [
    { label: "WhatsApp", value: formatPhone(patient.phone) },
    { label: "Email", value: patient.email || "—" },
    { label: "Total booking", value: String(patient.booking_count) },
    {
      label: "Kunjungan terakhir",
      value: patient.last_visit_at ? formatDateShort(patient.last_visit_at) : "Belum pernah",
    },
    { label: "Terdaftar sejak", value: formatDateShort(patient.created_at) },
  ];

  return (
    <div className="space-y-6">
      {backLink}

      <h1 className="text-2xl font-semibold break-words text-neutral-900">{patient.name}</h1>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
        <SectionCard title="Data pasien">
          <dl className="space-y-4">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="font-medium break-words text-neutral-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Riwayat booking" description="Terbaru lebih dulu.">
          <BookingHistory bookings={patient.bookings} />
        </SectionCard>
      </div>
    </div>
  );
}
