"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import { QueryError } from "@/components/query-error";
import { StepHeader } from "@/components/booking/step-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSlots } from "@/lib/api/booking";
import type { Slot, Therapist } from "@/lib/api/types";
import { dayPeriod, type DayPeriod } from "@/lib/dates";
import { formatDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";

const PERIODS: { key: DayPeriod; label: string }[] = [
  { key: "pagi", label: "Pagi" },
  { key: "siang", label: "Siang" },
  { key: "sore", label: "Sore" },
];

export function slotsQueryKey(treatment: string, therapist: string, date: string) {
  return ["slots", treatment, therapist, date] as const;
}

type TimeStepProps = {
  treatment: string;
  therapist: Therapist;
  therapists: Therapist[];
  date: string;
  selected: string | null;
  onSelect: (time: string) => void;
  onPickTherapist: (slug: string) => void;
  onPickDate: () => void;
};

function OtherTherapists({
  treatment,
  date,
  others,
  onPick,
}: {
  treatment: string;
  date: string;
  others: Therapist[];
  onPick: (slug: string) => void;
}) {
  const results = useQueries({
    queries: others.map((therapist) => ({
      queryKey: slotsQueryKey(treatment, therapist.slug, date),
      queryFn: () => fetchSlots(treatment, therapist.slug, date),
    })),
  });

  if (results.some((result) => result.isPending)) {
    return <Skeleton className="h-10 w-2/3" />;
  }

  const available = others.filter((_, index) => (results[index].data?.length ?? 0) > 0);

  if (available.length === 0) {
    return <p className="text-sm text-neutral-700">Terapis lain juga sudah penuh di tanggal ini.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-700">Terapis lain yang masih tersedia:</p>
      <div className="flex flex-wrap gap-2">
        {available.map((therapist) => (
          <Button key={therapist.id} type="button" variant="secondary" size="sm" onClick={() => onPick(therapist.slug)}>
            {therapist.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function TimeStep({
  treatment,
  therapist,
  therapists,
  date,
  selected,
  onSelect,
  onPickTherapist,
  onPickDate,
}: TimeStepProps) {
  const slotsQuery = useQuery({
    queryKey: slotsQueryKey(treatment, therapist.slug, date),
    queryFn: () => fetchSlots(treatment, therapist.slug, date),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const grouped = PERIODS.map((period) => ({
    ...period,
    slots: (slotsQuery.data ?? []).filter((slot: Slot) => dayPeriod(slot.time) === period.key),
  })).filter((group) => group.slots.length > 0);

  const others = therapists.filter((item) => item.slug !== therapist.slug);

  return (
    <div className="space-y-6">
      <StepHeader
        title="Pilih jam"
        description={`${formatDateLong(date)} bersama ${therapist.name}. Semua jam dalam WIB.`}
        onBack={onPickDate}
      />

      {slotsQuery.isPending ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5" aria-busy="true" aria-label="Memuat jam">
          {Array.from({ length: 10 }, (_, index) => (
            <Skeleton key={index} className="h-11 rounded-md" />
          ))}
        </div>
      ) : slotsQuery.error ? (
        <QueryError error={slotsQuery.error} onRetry={() => slotsQuery.refetch()} />
      ) : grouped.length === 0 ? (
        <div className="space-y-4 rounded-lg border border-dashed border-neutral-300 bg-card p-6">
          <p className="flex items-center gap-2 font-semibold text-neutral-900">
            <CalendarClock aria-hidden="true" strokeWidth={1.75} className="size-5 text-sage-600" />
            Jadwal {therapist.name} penuh di tanggal ini.
          </p>
          {others.length > 0 && (
            <OtherTherapists treatment={treatment} date={date} others={others} onPick={onPickTherapist} />
          )}
          <Button type="button" variant="outline" size="sm" onClick={onPickDate}>
            Pilih tanggal lain
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <fieldset key={group.key} className="space-y-3">
              <legend className="type-overline mb-3 text-neutral-600">{group.label}</legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {group.slots.map((slot) => {
                  const isSelected = slot.time === selected;
                  return (
                    <button
                      key={slot.start_at}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onSelect(slot.time)}
                      className={cn(
                        "h-11 rounded-md border text-base font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isSelected
                          ? "border-sage-600 bg-sage-600 text-white"
                          : "border-neutral-300 bg-card text-neutral-900 hover:border-sage-600",
                      )}
                    >
                      {slot.time.replace(":", ".")}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
}
