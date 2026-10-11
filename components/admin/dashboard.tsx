"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Clock,
  Sparkles,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useAdminUser } from "@/components/admin/admin-user";
import { BookingList } from "@/components/admin/bookings/booking-list";
import { NeedsActionBadge } from "@/components/admin/bookings/needs-action-badge";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import { adminBookingsKey, fetchAdminBookings } from "@/lib/api/admin-bookings";
import {
  adminDashboardKey,
  fetchAdminDashboard,
  type DashboardPendingBooking,
  type DashboardTopTreatment,
} from "@/lib/api/admin-dashboard";
import { toDateKey } from "@/lib/dates";
import { formatDateLong, formatDateShort, formatRupiah, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number | undefined;
  format?: (value: number) => string;
  description: string;
  icon: LucideIcon;
  tone?: "default" | "danger";
  href: string;
};

function StatCard({ label, value, format = String, description, icon: Icon, tone = "default", href }: StatCardProps) {
  return (
    <Link href={href} className="group rounded-lg bg-card p-6 shadow-sm transition-shadow duration-150 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon
          aria-hidden="true"
          strokeWidth={1.75}
          className={cn("size-5", tone === "danger" ? "text-danger" : "text-sage-600")}
        />
      </div>
      {value === undefined ? (
        <Skeleton className="mt-2 h-9 w-16" />
      ) : (
        <p
          className={cn(
            "mt-2 text-3xl font-semibold tabular-nums",
            tone === "danger" && value > 0 ? "text-danger" : "text-neutral-900",
          )}
        >
          {format(value)}
        </p>
      )}
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

function Section({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-sage-700 hover:underline"
        >
          {linkLabel}
          <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function PendingList({ bookings }: { bookings: DashboardPendingBooking[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {bookings.map((booking) => (
        <li key={booking.id}>
          <Link href={`/admin/booking/${booking.id}`} className="flex items-start gap-3 p-4 hover:bg-neutral-50">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-semibold text-neutral-900">{booking.patient_name}</p>
                {booking.needs_action && <NeedsActionBadge />}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDateShort(booking.start_at)}, {formatTime(booking.start_at)} · {booking.treatment_name} ·{" "}
                {booking.therapist_name}
              </p>
            </div>
            <ChevronRight aria-hidden="true" strokeWidth={1.75} className="mt-1 size-5 shrink-0 text-neutral-400" />
            <span className="sr-only">Detail booking {booking.code}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TopTreatments({ items }: { items: DashboardTopTreatment[] }) {
  const max = Math.max(...items.map((item) => item.count));
  return (
    <ol className="space-y-4 rounded-lg bg-card p-6 shadow-sm">
      {items.map((item) => (
        <li key={item.name} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium text-neutral-900">{item.name}</span>
            <span className="shrink-0 text-muted-foreground tabular-nums">{item.count} booking</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100" aria-hidden="true">
            <div className="h-2 rounded-full bg-sage-500" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Dashboard() {
  const user = useAdminUser();
  const isAdmin = user.role === "admin";
  const [today] = useState(() => toDateKey(new Date()));

  const todayFilters = { date_from: today, date_to: today, per_page: 100 };
  const todayQuery = useQuery({
    queryKey: [...adminBookingsKey, todayFilters],
    queryFn: () => fetchAdminBookings(todayFilters),
  });
  const summaryQuery = useQuery({ queryKey: adminDashboardKey, queryFn: fetchAdminDashboard, enabled: isAdmin });
  const summary = summaryQuery.data;
  const showSummary = isAdmin && !summaryQuery.error;

  return (
    <div className="space-y-8">
      <PageHeader title={`Halo, ${user.name}`} description={formatDateLong(today)} />

      {isAdmin && summaryQuery.error && (
        <QueryError error={summaryQuery.error} onRetry={() => summaryQuery.refetch()} />
      )}

      <div className={cn("grid gap-4 sm:grid-cols-2", isAdmin ? "xl:grid-cols-4" : "lg:grid-cols-3")}>
        <StatCard
          label="Booking hari ini"
          value={showSummary ? summary?.today_count : todayQuery.data?.meta.total}
          description={showSummary ? "Aktif, semua terapis" : isAdmin ? "Semua terapis" : "Jadwal Anda"}
          icon={CalendarDays}
          href="/admin/booking?range=today"
        />
        {showSummary && (
          <>
            <StatCard
              label="Menunggu konfirmasi"
              value={summary?.pending_count}
              description="Perlu dikonfirmasi atau dibatalkan"
              icon={Clock}
              href="/admin/booking?range=all&status=pending"
            />
            <StatCard
              label="Perlu tindakan"
              value={summary?.needs_action_count}
              description="Belum dikonfirmasi padahal jamnya sudah lewat"
              icon={TriangleAlert}
              tone="danger"
              href="/admin/booking?range=all&status=pending"
            />
            <StatCard
              label="Pendapatan bulan ini"
              value={summary?.revenue_month}
              format={formatRupiah}
              description="Dari invoice lunas"
              icon={Wallet}
              href="/admin/invoice?status=paid"
            />
          </>
        )}
      </div>

      {showSummary && (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Section title="Menunggu konfirmasi" href="/admin/booking?range=all&status=pending" linkLabel="Lihat semua">
            {!summary ? (
              <Skeleton className="h-40 rounded-lg" />
            ) : summary.pending_upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="Semua beres"
                description="Tidak ada booking yang menunggu konfirmasi."
              />
            ) : (
              <PendingList bookings={summary.pending_upcoming} />
            )}
          </Section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Treatment terlaris bulan ini</h2>
            {!summary ? (
              <Skeleton className="h-40 rounded-lg" />
            ) : summary.top_treatments.length === 0 ? (
              <EmptyState icon={Sparkles} title="Belum ada data" description="Belum ada booking selesai bulan ini." />
            ) : (
              <TopTreatments items={summary.top_treatments} />
            )}
          </section>
        </div>
      )}

      <Section title="Jadwal hari ini" href="/admin/booking?range=today" linkLabel="Buka daftar">
        {todayQuery.isPending ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : todayQuery.error ? (
          <QueryError error={todayQuery.error} onRetry={() => todayQuery.refetch()} />
        ) : todayQuery.data.data.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Belum ada booking hari ini"
            description="Jadwal hari ini masih kosong."
          />
        ) : (
          <BookingList bookings={todayQuery.data.data} />
        )}
      </Section>
    </div>
  );
}
