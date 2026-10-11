"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarCheck, CalendarDays, Clock, TriangleAlert, type LucideIcon } from "lucide-react";
import { useAdminUser } from "@/components/admin/admin-user";
import { BookingList } from "@/components/admin/bookings/booking-list";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import { adminBookingsKey, fetchAdminBookings, type AdminBookingFilters } from "@/lib/api/admin-bookings";
import { toDateKey } from "@/lib/dates";
import { formatDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";

const PENDING_PREVIEW = 8;

type StatCardProps = {
  label: string;
  value: number | undefined;
  description: string;
  icon: LucideIcon;
  tone?: "default" | "danger";
  href: string;
};

function StatCard({ label, value, description, icon: Icon, tone = "default", href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-lg bg-card p-6 shadow-sm transition-shadow duration-150 hover:shadow-md"
    >
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
        <p className={cn("mt-2 text-3xl font-semibold", tone === "danger" && value > 0 ? "text-danger" : "text-neutral-900")}>
          {value}
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

function useBookings(filters: AdminBookingFilters, enabled = true) {
  return useQuery({
    queryKey: [...adminBookingsKey, filters],
    queryFn: () => fetchAdminBookings(filters),
    enabled,
  });
}

export function Dashboard() {
  const user = useAdminUser();
  const isAdmin = user.role === "admin";
  const [today] = useState(() => toDateKey(new Date()));

  const todayQuery = useBookings({ date_from: today, date_to: today, per_page: 100 });
  const pendingQuery = useBookings({ status: "pending", per_page: 100 }, isAdmin);

  const pending = pendingQuery.data?.data ?? [];
  const needsAction = pendingQuery.data ? pending.filter((booking) => booking.needs_action).length : undefined;

  return (
    <div className="space-y-8">
      <PageHeader title={`Halo, ${user.name}`} description={formatDateLong(today)} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Booking hari ini"
          value={todayQuery.data?.meta.total}
          description={isAdmin ? "Semua terapis" : "Jadwal Anda"}
          icon={CalendarDays}
          href="/admin/booking?range=today"
        />
        {isAdmin && (
          <>
            <StatCard
              label="Menunggu konfirmasi"
              value={pendingQuery.data?.meta.total}
              description="Perlu dikonfirmasi atau dibatalkan"
              icon={Clock}
              href="/admin/booking?range=all&status=pending"
            />
            <StatCard
              label="Perlu tindakan"
              value={needsAction}
              description="Belum dikonfirmasi padahal jamnya sudah lewat"
              icon={TriangleAlert}
              tone="danger"
              href="/admin/booking?range=all&status=pending"
            />
          </>
        )}
      </div>

      {isAdmin && (
        <Section title="Menunggu konfirmasi" href="/admin/booking?range=all&status=pending" linkLabel="Lihat semua">
          {pendingQuery.isPending ? (
            <Skeleton className="h-40 rounded-lg" />
          ) : pendingQuery.error ? (
            <QueryError error={pendingQuery.error} onRetry={() => pendingQuery.refetch()} />
          ) : pending.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="Semua beres" description="Tidak ada booking yang menunggu konfirmasi." />
          ) : (
            <BookingList bookings={pending.slice(0, PENDING_PREVIEW)} />
          )}
        </Section>
      )}

      <Section title="Jadwal hari ini" href="/admin/booking?range=today" linkLabel="Buka daftar">
        {todayQuery.isPending ? (
          <Skeleton className="h-40 rounded-lg" />
        ) : todayQuery.error ? (
          <QueryError error={todayQuery.error} onRetry={() => todayQuery.refetch()} />
        ) : todayQuery.data.data.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Belum ada booking hari ini" description="Jadwal hari ini masih kosong." />
        ) : (
          <BookingList bookings={todayQuery.data.data} />
        )}
      </Section>
    </div>
  );
}
