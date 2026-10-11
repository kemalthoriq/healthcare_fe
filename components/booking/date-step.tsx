"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarX } from "lucide-react";
import { id } from "react-day-picker/locale";
import { QueryError } from "@/components/booking/query-error";
import { StepHeader } from "@/components/booking/step-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { fetchAvailableDates } from "@/lib/api/booking";
import { addMonths, fromDateKey, fromMonthKey, toDateKey, toMonthKey } from "@/lib/dates";
import { TIME_ZONE } from "@/lib/format";

const MAX_MONTHS_AHEAD = 2;

type DateStepProps = {
  treatment: string;
  therapist: string;
  therapistName: string;
  selected: string | null;
  onSelect: (date: string) => void;
  onBack: () => void;
};

export function DateStep({ treatment, therapist, therapistName, selected, onSelect, onBack }: DateStepProps) {
  const [firstMonth] = useState(() => toMonthKey(new Date()));
  const lastMonth = addMonths(firstMonth, MAX_MONTHS_AHEAD);
  const [month, setMonth] = useState(() =>
    selected && selected.slice(0, 7) >= firstMonth ? selected.slice(0, 7) : firstMonth,
  );

  const datesQuery = useQuery({
    queryKey: ["available-dates", treatment, therapist, month],
    queryFn: () => fetchAvailableDates(treatment, therapist, month),
  });

  const available = new Set(datesQuery.data ?? []);
  const isEmptyMonth = datesQuery.isSuccess && available.size === 0;

  return (
    <div className="space-y-6">
      <StepHeader
        title="Pilih tanggal"
        description={`Tanggal yang bisa dipilih adalah hari ketika ${therapistName} masih memiliki jam kosong.`}
        onBack={onBack}
      />

      {datesQuery.error ? (
        <QueryError error={datesQuery.error} onRetry={() => datesQuery.refetch()} />
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-card p-2 shadow-xs sm:p-4">
          <Calendar
            mode="single"
            locale={id}
            timeZone={TIME_ZONE}
            month={fromMonthKey(month)}
            onMonthChange={(value) => setMonth(toMonthKey(value))}
            startMonth={fromMonthKey(firstMonth)}
            endMonth={fromMonthKey(lastMonth)}
            selected={selected ? fromDateKey(selected) : undefined}
            onSelect={(value) => value && onSelect(toDateKey(value))}
            disabled={(day) => !available.has(toDateKey(day))}
            showOutsideDays={false}
            aria-busy={datesQuery.isFetching}
            className="mx-auto w-full max-w-sm bg-transparent p-0 [--cell-size:--spacing(11)]"
            classNames={{
              root: "w-full",
              day_button: "text-base font-medium",
              disabled: "text-neutral-400 opacity-60",
              today: "font-bold text-sage-700",
            }}
          />
        </div>
      )}

      {datesQuery.isFetching && !datesQuery.data && (
        <p className="text-sm text-muted-foreground" role="status">
          Memuat jadwal…
        </p>
      )}

      {isEmptyMonth && (
        <div className="flex flex-col items-start gap-3 rounded-lg bg-neutral-100 p-4">
          <p className="flex items-center gap-2 text-sm text-neutral-700">
            <CalendarX aria-hidden="true" strokeWidth={1.75} className="size-5 text-neutral-500" />
            Belum ada jadwal kosong di bulan ini.
          </p>
          {month < lastMonth && (
            <Button type="button" variant="outline" size="sm" onClick={() => setMonth(addMonths(month, 1))}>
              Lihat bulan berikutnya
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
