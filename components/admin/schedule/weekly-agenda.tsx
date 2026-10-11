"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CalendarOff, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { adminBookingsKey, fetchAdminBookings, type AdminBooking } from "@/lib/api/admin-bookings";
import { adminTherapistsKey, fetchAdminTherapists } from "@/lib/api/admin-catalog";
import { fetchSchedules, fetchTimeOff, schedulesKey, timeOffKey, type Shift, type TimeOff } from "@/lib/api/admin-schedule";
import type { Therapist } from "@/lib/api/types";
import { bookingStatusClass } from "@/lib/booking-status";
import { addDays, fromDateKey, startOfWeek, toDateKey, weekdayOf } from "@/lib/dates";
import { formatDateShort, formatTime } from "@/lib/format";
import { clockLabel } from "@/lib/schedule";
import { cn } from "@/lib/utils";

const dayFormat = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "short" });

function overlapsDay(item: TimeOff, dateKey: string): boolean {
  const dayStart = new Date(`${dateKey}T00:00:00+07:00`).getTime();
  const dayEnd = dayStart + 86_400_000;
  return new Date(item.start_at).getTime() < dayEnd && new Date(item.end_at).getTime() > dayStart;
}

type DayEntry = {
  therapist: Therapist;
  shifts: Shift[];
  timeOff: TimeOff[];
  bookings: AdminBooking[];
  loaded: boolean;
};

function TherapistDay({ entry, showName }: { entry: DayEntry; showName: boolean }) {
  const { therapist, shifts, timeOff, bookings, loaded } = entry;
  return (
    <div className="space-y-2">
      {showName && <p className="text-sm font-semibold text-neutral-900">{therapist.name}</p>}
      <p className="text-xs text-muted-foreground">
        {!loaded
          ? "Memuat jadwal…"
          : shifts.length === 0
            ? "Libur"
            : shifts.map((shift) => `${clockLabel(shift.start_time)}–${clockLabel(shift.end_time)}`).join(", ")}
      </p>
      {timeOff.map((item) => (
        <p key={item.id} className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
          <CalendarOff aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
          Cuti {formatDateShort(item.start_at)} {formatTime(item.start_at).replace(" WIB", "")} – {formatDateShort(item.end_at)}{" "}
          {formatTime(item.end_at)}
        </p>
      ))}
      {bookings.length > 0 && (
        <ul className="space-y-1">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <Link
                href={`/admin/booking/${booking.id}`}
                className={cn(
                  "flex items-baseline gap-2 rounded-md px-2 py-1 text-xs hover:ring-1 hover:ring-sage-600",
                  bookingStatusClass[booking.status],
                )}
              >
                <span className="font-semibold">{formatTime(booking.start_at).replace(" WIB", "")}</span>
                <span className="truncate">{booking.patient_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WeeklyAgenda() {
  const uid = useId();
  const [today] = useState(() => toDateKey(new Date()));
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [therapistFilter, setTherapistFilter] = useState("");
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const therapistsQuery = useQuery({ queryKey: adminTherapistsKey, queryFn: fetchAdminTherapists });
  const therapists = (therapistsQuery.data ?? []).filter(
    (item) => item.is_active && (therapistFilter === "" || String(item.id) === therapistFilter),
  );

  const filters = { date_from: days[0], date_to: days[6], per_page: 100 };
  const bookingsQuery = useQuery({
    queryKey: [...adminBookingsKey, filters],
    queryFn: () => fetchAdminBookings(filters),
  });

  const scheduleResults = useQueries({
    queries: therapists.map((item) => ({ queryKey: schedulesKey(item.id), queryFn: () => fetchSchedules(item.id) })),
  });
  const timeOffResults = useQueries({
    queries: therapists.map((item) => ({ queryKey: timeOffKey(item.id), queryFn: () => fetchTimeOff(item.id) })),
  });

  const bookings = (bookingsQuery.data?.data ?? []).filter((booking) => booking.status !== "cancelled");
  const error = therapistsQuery.error ?? bookingsQuery.error;

  return (
    <div className="space-y-6">
      <PageHeader title="Jadwal" description="Jam kerja, cuti, dan booking per minggu. Booking dibatalkan tidak ditampilkan." />

      <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            aria-label="Minggu sebelumnya"
          >
            <ChevronLeft strokeWidth={1.75} />
          </Button>
          <p className="min-w-44 text-center text-sm font-semibold text-neutral-900" aria-live="polite">
            {formatDateShort(days[0])} – {formatDateShort(days[6])}
          </p>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            aria-label="Minggu berikutnya"
          >
            <ChevronRight strokeWidth={1.75} />
          </Button>
          {weekStart !== startOfWeek(today) && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(today))}>
              Minggu ini
            </Button>
          )}
        </div>
        <div className="w-full space-y-2 sm:w-64">
          <Label htmlFor={`${uid}-therapist`}>Terapis</Label>
          <NativeSelect
            id={`${uid}-therapist`}
            value={therapistFilter}
            onChange={(event) => setTherapistFilter(event.target.value)}
          >
            <option value="">Semua terapis aktif</option>
            {(therapistsQuery.data ?? [])
              .filter((item) => item.is_active)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </NativeSelect>
        </div>
      </div>

      {error ? (
        <QueryError
          error={error}
          onRetry={() => {
            therapistsQuery.refetch();
            bookingsQuery.refetch();
          }}
        />
      ) : therapistsQuery.isPending || bookingsQuery.isPending ? (
        <Skeleton className="h-96 rounded-lg" />
      ) : therapists.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada terapis aktif.</p>
      ) : (
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {days.map((dateKey) => {
            const dayBookings = bookings.filter((booking) => toDateKey(new Date(booking.start_at)) === dateKey);
            const isToday = dateKey === today;
            const weekday = weekdayOf(dateKey);
            const entries: DayEntry[] = therapists
              .map((therapist, index) => ({
                therapist,
                shifts: (scheduleResults[index]?.data ?? []).filter((shift) => shift.day_of_week === weekday),
                timeOff: (timeOffResults[index]?.data ?? []).filter((item) => overlapsDay(item, dateKey)),
                bookings: dayBookings.filter((booking) => booking.therapist_id === therapist.id),
                loaded: !!scheduleResults[index]?.data,
              }))
              .filter(
                (entry) =>
                  therapists.length === 1 ||
                  !entry.loaded ||
                  entry.shifts.length > 0 ||
                  entry.timeOff.length > 0 ||
                  entry.bookings.length > 0,
              );
            return (
              <li
                key={dateKey}
                className={cn("space-y-4 rounded-lg bg-card p-4 shadow-sm", isToday && "ring-2 ring-sage-600")}
              >
                <p className="flex items-center justify-between text-sm font-semibold capitalize text-neutral-900">
                  {dayFormat.format(fromDateKey(dateKey))}
                  {isToday && <span className="text-xs font-medium text-sage-700 normal-case">Hari ini</span>}
                </p>
                <div className="space-y-4">
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Tidak ada jadwal.</p>
                  ) : (
                    entries.map((entry) => (
                      <TherapistDay key={entry.therapist.id} entry={entry} showName={therapists.length > 1} />
                    ))
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
