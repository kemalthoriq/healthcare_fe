"use client";

import { useState, useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarSearch } from "lucide-react";
import { useAdminUser } from "@/components/admin/admin-user";
import { BookingList } from "@/components/admin/bookings/booking-list";
import { Pagination } from "@/components/admin/bookings/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { adminBookingsKey, fetchAdminBookings, type AdminBookingFilters } from "@/lib/api/admin-bookings";
import { adminTherapistsKey, fetchAdminTherapists } from "@/lib/api/admin-catalog";
import type { BookingStatus } from "@/lib/api/types";
import { bookingStatusLabel } from "@/lib/booking-status";
import { isDateKey, toDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const PER_PAGE = 20;

const RANGES = [
  { key: "today", label: "Hari ini" },
  { key: "upcoming", label: "Mendatang" },
  { key: "all", label: "Semua" },
  { key: "custom", label: "Pilih tanggal" },
] as const;

type Range = (typeof RANGES)[number]["key"];

const STATUSES = Object.keys(bookingStatusLabel) as BookingStatus[];

function isRange(value: string | null): value is Range {
  return RANGES.some((range) => range.key === value);
}

function isStatus(value: string | null): value is BookingStatus {
  return STATUSES.includes(value as BookingStatus);
}

export function BookingsPage() {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const user = useAdminUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [today] = useState(() => toDateKey(new Date()));

  const rawRange = searchParams.get("range");
  const range: Range = isRange(rawRange) ? rawRange : "upcoming";
  const rawStatus = searchParams.get("status");
  const status = isStatus(rawStatus) ? rawStatus : undefined;
  const therapist = searchParams.get("therapist") ?? "";
  const rawFrom = searchParams.get("from");
  const rawTo = searchParams.get("to");
  const from = isDateKey(rawFrom) ? rawFrom : "";
  const to = isDateKey(rawTo) ? rawTo : "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const filters: AdminBookingFilters = {
    status,
    therapist_id: user.role === "admin" ? therapist : undefined,
    page,
    per_page: PER_PAGE,
    ...(range === "today" && { date_from: today, date_to: today }),
    ...(range === "upcoming" && { date_from: today }),
    ...(range === "custom" && { date_from: from, date_to: to }),
  };

  const bookingsQuery = useQuery({
    queryKey: [...adminBookingsKey, filters],
    queryFn: () => fetchAdminBookings(filters),
    placeholderData: keepPreviousData,
  });

  const therapistsQuery = useQuery({
    queryKey: adminTherapistsKey,
    queryFn: fetchAdminTherapists,
    enabled: user.role === "admin",
  });

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }
    if (!("page" in changes)) {
      next.delete("page");
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.role === "admin" ? "Booking" : "Booking Saya"}
        description="Diurutkan dari jadwal terdekat."
      />

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div role="group" aria-label="Rentang waktu" className="flex flex-wrap gap-2">
          {RANGES.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={range === item.key}
              onClick={() => update({ range: item.key === "upcoming" ? null : item.key })}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                range === item.key
                  ? "border-sage-600 bg-sage-600 text-white"
                  : "border-neutral-300 bg-card text-neutral-700 hover:border-sage-600",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor={f("filter-status")}>Status</Label>
            <NativeSelect
              id={f("filter-status")}
              value={status ?? ""}
              onChange={(event) => update({ status: event.target.value || null })}
            >
              <option value="">Semua status</option>
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {bookingStatusLabel[value]}
                </option>
              ))}
            </NativeSelect>
          </div>

          {user.role === "admin" && (
            <div className="space-y-2">
              <Label htmlFor={f("filter-therapist")}>Terapis</Label>
              <NativeSelect
                id={f("filter-therapist")}
                value={therapist}
                onChange={(event) => update({ therapist: event.target.value || null })}
              >
                <option value="">Semua terapis</option>
                {(therapistsQuery.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.is_active ? "" : " (nonaktif)"}
                  </option>
                ))}
              </NativeSelect>
            </div>
          )}

          {range === "custom" && (
            <>
              <div className="space-y-2">
                <Label htmlFor={f("filter-from")}>Dari tanggal</Label>
                <Input
                  id={f("filter-from")}
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(event) => update({ from: event.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={f("filter-to")}>Sampai tanggal</Label>
                <Input
                  id={f("filter-to")}
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(event) => update({ to: event.target.value || null })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {bookingsQuery.isPending ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat booking">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : bookingsQuery.error ? (
        <QueryError error={bookingsQuery.error} onRetry={() => bookingsQuery.refetch()} />
      ) : bookingsQuery.data.data.length === 0 ? (
        <EmptyState
          icon={CalendarSearch}
          title="Tidak ada booking"
          description="Belum ada booking yang cocok dengan filter ini."
        />
      ) : (
        <div className={cn("space-y-4 transition-opacity", bookingsQuery.isPlaceholderData && "opacity-60")}>
          <BookingList bookings={bookingsQuery.data.data} />
          <Pagination meta={bookingsQuery.data.meta} onPageChange={(value) => update({ page: String(value) })} />
        </div>
      )}
    </div>
  );
}
