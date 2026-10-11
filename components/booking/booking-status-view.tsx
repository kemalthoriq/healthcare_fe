"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, Clock, Info, MessageCircle, SearchX, TriangleAlert } from "lucide-react";
import { CancelBookingDialog } from "@/components/booking/cancel-booking-dialog";
import { CopyCodeButton } from "@/components/booking/copy-code-button";
import { StatusBadge } from "@/components/booking/status-badge";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchBooking, publicBookingKey } from "@/lib/api/booking";
import type { PublicBooking } from "@/lib/api/types";
import { formatDateLong, formatDuration, formatRupiah, formatTime } from "@/lib/format";
import { whatsAppUrl } from "@/lib/whatsapp";

export function BookingStatusSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat status booking">
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
    </div>
  );
}

type BookingStatusViewProps = {
  code: string;
  clinicWhatsapp: string;
};

export function BookingStatusView({ code, clinicWhatsapp }: BookingStatusViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const key = publicBookingKey(code);
  const query = useQuery({ queryKey: key, queryFn: () => fetchBooking(code), staleTime: 0 });

  if (query.isPending) {
    return <BookingStatusSkeleton />;
  }

  if (query.isError) {
    return <QueryError error={query.error} onRetry={() => query.refetch()} />;
  }

  const booking = query.data;

  if (!booking) {
    return (
      <EmptyState
        icon={SearchX}
        title="Booking tidak ditemukan"
        description="Periksa kembali kode booking Anda. Kode terdiri dari huruf dan angka, misalnya LMR-XXXX-XXXX."
      >
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href="/booking">Cek kode lain</Link>
        </Button>
      </EmptyState>
    );
  }

  function handleCancelled(updated: PublicBooking | null) {
    if (updated) {
      queryClient.setQueryData(key, updated);
    } else {
      queryClient.invalidateQueries({ queryKey: key });
    }
    if (searchParams.get("baru")) {
      router.replace(pathname);
    }
  }

  const isNew = searchParams.get("baru") === "1";
  const isActive = booking.status === "pending" || booking.status === "confirmed";
  const durationMinutes = Math.round(
    (new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / 60000,
  );

  const rows = [
    { label: "Nama", value: booking.patient_name },
    { label: "Treatment", value: booking.treatment.name },
    { label: "Terapis", value: booking.therapist.name },
    { label: "Tanggal", value: formatDateLong(booking.start_at) },
    {
      label: "Jam",
      value: `${formatTime(booking.start_at).replace(" WIB", "")}–${formatTime(booking.end_at)}`,
    },
    { label: "Durasi", value: formatDuration(durationMinutes) },
    { label: "Harga", value: formatRupiah(booking.price) },
  ];

  return (
    <div className="space-y-6">
      {isNew && (
        <Alert variant="success">
          <CircleCheck aria-hidden="true" strokeWidth={1.75} />
          <AlertTitle>Booking berhasil dibuat</AlertTitle>
          <AlertDescription>
            <p>
              Simpan kode booking di bawah ini. Anda bisa membuka halaman ini lagi untuk mengecek status atau
              membatalkan booking.
            </p>
            <p>Bila Anda mengisi email, detail booking juga dikirim ke email Anda (cek folder Spam).</p>
          </AlertDescription>
        </Alert>
      )}

      <section className="rounded-lg bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Kode booking</p>
            <div className="flex items-center gap-1">
              <p className="font-mono text-2xl font-semibold tracking-wider text-neutral-900">{booking.code}</p>
              <CopyCodeButton code={booking.code} />
            </div>
          </div>
          <StatusBadge status={booking.status} className="text-sm" />
        </div>

        <dl className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="font-medium text-neutral-900">{row.value}</dd>
            </div>
          ))}
          {booking.note && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Catatan Anda</dt>
              <dd className="whitespace-pre-line text-neutral-900">{booking.note}</dd>
            </div>
          )}
          {booking.status === "cancelled" && booking.cancel_reason && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Alasan pembatalan</dt>
              <dd className="whitespace-pre-line text-neutral-900">{booking.cancel_reason}</dd>
            </div>
          )}
        </dl>
      </section>

      {booking.status === "pending" && (
        <Alert variant="info">
          <Clock aria-hidden="true" strokeWidth={1.75} />
          <AlertTitle>Menunggu konfirmasi klinik</AlertTitle>
          <AlertDescription>Kami akan mengonfirmasi booking Anda secepatnya.</AlertDescription>
        </Alert>
      )}

      {isActive && booking.can_cancel && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-6">
          <p className="flex items-start gap-2 text-sm text-neutral-700">
            <Info aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-neutral-500" />
            Pembatalan bisa dilakukan sampai {formatDateLong(booking.cancel_deadline)} pukul{" "}
            {formatTime(booking.cancel_deadline)}.
          </p>
          <CancelBookingDialog code={booking.code} onDone={handleCancelled} />
        </div>
      )}

      {isActive && !booking.can_cancel && (
        <Alert variant="warning">
          <TriangleAlert aria-hidden="true" strokeWidth={1.75} />
          <AlertTitle>Batas pembatalan sudah lewat</AlertTitle>
          <AlertDescription>
            Booking ini tidak bisa dibatalkan lagi secara online. Silakan hubungi klinik bila ada perubahan.
          </AlertDescription>
        </Alert>
      )}

      {clinicWhatsapp && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-6">
          <p className="flex-1 text-sm text-neutral-700">Ada pertanyaan tentang booking ini?</p>
          <Button asChild variant="whatsapp" size="sm">
            <a
              href={whatsAppUrl(clinicWhatsapp, `Halo, saya ingin bertanya tentang booking ${booking.code}.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden="true" strokeWidth={1.75} />
              Hubungi via WA
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
