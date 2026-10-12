"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, History, Info, MessageCircle, SearchX } from "lucide-react";
import { useAdminUser } from "@/components/admin/admin-user";
import { CancelAdminDialog } from "@/components/admin/bookings/cancel-admin-dialog";
import { ConfirmActionDialog } from "@/components/admin/bookings/confirm-action-dialog";
import { NeedsActionBadge } from "@/components/admin/bookings/needs-action-badge";
import { RescheduleDialog } from "@/components/admin/bookings/reschedule-dialog";
import { TreatmentNoteForm } from "@/components/admin/bookings/treatment-note-form";
import { useBookingMutations } from "@/components/admin/bookings/use-booking-mutations";
import { BookingInvoice } from "@/components/admin/invoices/booking-invoice";
import { StatusBadge } from "@/components/booking/status-badge";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminBookingKey, fetchAdminBooking, type AdminBooking } from "@/lib/api/admin-bookings";
import { fetchPublicClinic, publicClinicKey } from "@/lib/api/booking";
import { isApiError } from "@/lib/api/client";
import { formatDateLong, formatDateShort, formatPhone, formatRupiah, formatTime } from "@/lib/format";
import { bookingWhatsAppUrl } from "@/lib/whatsapp";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-card p-6 shadow-sm">
      <h2 className="text-[17px] font-semibold text-neutral-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Rows({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-sm text-muted-foreground">{row.label}</dt>
          <dd className="font-medium break-words text-neutral-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function dateTime(value: string) {
  return `${formatDateShort(value)}, ${formatTime(value)}`;
}

function Timeline({ booking }: { booking: AdminBooking }) {
  const events = [
    { label: "Dibuat", at: booking.created_at },
    { label: "Dikonfirmasi", at: booking.confirmed_at },
    { label: "Selesai", at: booking.completed_at },
    { label: "Dibatalkan", at: booking.cancelled_at },
  ].filter((event): event is { label: string; at: string } => !!event.at);

  return (
    <ol className="space-y-3 border-l-2 border-sage-200 pl-4">
      {events.map((event) => (
        <li key={event.label} className="text-sm">
          <p className="font-medium text-neutral-900">{event.label}</p>
          <p className="text-muted-foreground">{dateTime(event.at)}</p>
        </li>
      ))}
    </ol>
  );
}

function Actions({ booking }: { booking: AdminBooking }) {
  const user = useAdminUser();
  const [now] = useState(() => Date.now());
  const { action, cancel, reschedule } = useBookingMutations(booking.id);
  const started = new Date(booking.start_at).getTime() <= now;
  const isAdmin = user.role === "admin";
  const busy = action.isPending || cancel.isPending || reschedule.isPending;

  const canConfirm = isAdmin && booking.status === "pending";
  const canFinish = booking.status === "confirmed";
  const canNoShow = isAdmin && booking.status === "confirmed";
  const canCancel = isAdmin && (booking.status === "pending" || booking.status === "confirmed");
  const canReschedule = canCancel;

  if (!canConfirm && !canFinish && !canCancel) {
    return <p className="text-sm text-muted-foreground">Tidak ada aksi untuk booking dengan status ini.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {canConfirm && (
          <Button onClick={() => action.mutate("confirm")} disabled={busy}>
            Konfirmasi
          </Button>
        )}
        {canFinish && (
          <ConfirmActionDialog
            trigger={<Button disabled={busy || !started}>Tandai Selesai</Button>}
            title="Tandai booking selesai?"
            description="Status tidak bisa dikembalikan setelah ditandai selesai."
            confirmLabel="Ya, Selesai"
            pending={action.isPending}
            onConfirm={() => action.mutateAsync("complete")}
          />
        )}
        {canNoShow && (
          <ConfirmActionDialog
            trigger={
              <Button variant="outline" disabled={busy || !started}>
                Tidak Datang
              </Button>
            }
            title="Tandai pasien tidak datang?"
            description="Status tidak bisa dikembalikan setelah ditandai tidak datang."
            confirmLabel="Ya, Tidak Datang"
            destructive
            pending={action.isPending}
            onConfirm={() => action.mutateAsync("no-show")}
          />
        )}
        {canReschedule && (
          <RescheduleDialog booking={booking} pending={reschedule.isPending} onReschedule={reschedule.mutateAsync} />
        )}
        {canCancel && <CancelAdminDialog pending={cancel.isPending} onCancel={cancel.mutateAsync} />}
      </div>
      {canFinish && !started && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
          Tandai selesai{canNoShow ? " atau tidak datang" : ""} bisa dilakukan setelah jam mulai.
        </p>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat booking">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

export function BookingDetail({ id }: { id: number }) {
  const user = useAdminUser();
  const query = useQuery({ queryKey: adminBookingKey(id), queryFn: () => fetchAdminBooking(id) });
  const clinicQuery = useQuery({ queryKey: publicClinicKey, queryFn: fetchPublicClinic, staleTime: 5 * 60_000 });
  const clinicName = clinicQuery.data?.clinic_name || "Lumière Aesthetic Clinic";
  const { note } = useBookingMutations(id);

  const backLink = (
    <Link
      href="/admin/booking"
      className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-neutral-700 hover:text-sage-700"
    >
      <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
      Daftar booking
    </Link>
  );

  if (query.isPending) {
    return <DetailSkeleton />;
  }

  if (query.error) {
    if (isApiError(query.error) && (query.error.status === 404 || query.error.status === 403)) {
      return (
        <div className="space-y-6">
          {backLink}
          <EmptyState
            icon={SearchX}
            title="Booking tidak ditemukan"
            description="Booking ini tidak ada atau bukan milik Anda."
          />
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {backLink}
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      </div>
    );
  }

  const booking = query.data;

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-semibold tracking-wider text-neutral-900">{booking.code}</h1>
        <StatusBadge status={booking.status} />
        {booking.needs_action && <NeedsActionBadge />}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-6">
          <Card title="Jadwal">
            <Rows
              rows={[
                { label: "Tanggal", value: formatDateLong(booking.start_at) },
                {
                  label: "Jam",
                  value: `${formatTime(booking.start_at).replace(" WIB", "")}–${formatTime(booking.end_at)}`,
                },
                { label: "Treatment", value: booking.treatment_name },
                { label: "Terapis", value: booking.therapist_name },
                { label: "Harga", value: formatRupiah(booking.price) },
              ]}
            />
          </Card>

          <Card title="Pasien">
            <Rows
              rows={[
                { label: "Nama", value: booking.patient_name },
                { label: "WhatsApp", value: formatPhone(booking.patient_phone) },
                { label: "Email", value: booking.patient_email || "—" },
              ]}
            />
            {booking.note && (
              <div className="mt-4 rounded-md bg-neutral-100 p-4">
                <p className="text-sm text-muted-foreground">Catatan dari pasien</p>
                <p className="mt-1 whitespace-pre-line text-neutral-900">{booking.note}</p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="whatsapp" size="sm">
                <a href={bookingWhatsAppUrl(booking, clinicName)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" strokeWidth={1.75} />
                  Hubungi via WA
                </a>
              </Button>
              {user.role === "admin" && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/pasien?${new URLSearchParams({ q: booking.patient_phone })}`}>
                    <History aria-hidden="true" strokeWidth={1.75} />
                    Lihat riwayat pasien
                  </Link>
                </Button>
              )}
            </div>
          </Card>

          <Card title="Catatan treatment">
            <TreatmentNoteForm
              key={booking.treatment_note ?? ""}
              initial={booking.treatment_note ?? ""}
              pending={note.isPending}
              onSave={note.mutateAsync}
            />
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Aksi">
            <Actions booking={booking} />
            {booking.status === "cancelled" && booking.cancel_reason && (
              <div className="mt-4 rounded-md bg-danger-bg p-4 text-sm text-danger">
                <p className="font-semibold">Alasan pembatalan</p>
                <p className="mt-1 whitespace-pre-line">{booking.cancel_reason}</p>
              </div>
            )}
          </Card>
          {user.role === "admin" && booking.status === "completed" && (
            <Card title="Invoice">
              <BookingInvoice booking={booking} />
            </Card>
          )}
          <Card title="Riwayat">
            <Timeline booking={booking} />
          </Card>
        </div>
      </div>
    </div>
  );
}
