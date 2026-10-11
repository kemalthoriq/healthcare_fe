"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { id as localeId } from "react-day-picker/locale";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminBooking } from "@/lib/api/admin-bookings";
import {
  adminTherapistKey,
  adminTreatmentKey,
  fetchAdminTherapist,
  fetchAdminTreatment,
} from "@/lib/api/admin-catalog";
import { fetchAvailableDates, fetchSlots } from "@/lib/api/booking";
import { addMonths, fromDateKey, fromMonthKey, toDateKey, toMonthKey } from "@/lib/dates";
import { formatDateLong, TIME_ZONE } from "@/lib/format";
import { cn } from "@/lib/utils";

const MAX_MONTHS_AHEAD = 2;

type RescheduleDialogProps = {
  booking: AdminBooking;
  pending: boolean;
  onReschedule: (startAt: string) => Promise<unknown>;
};

function ReschedulePicker({
  booking,
  selected,
  onSelect,
}: {
  booking: AdminBooking;
  selected: string | null;
  onSelect: (startAt: string | null) => void;
}) {
  const [firstMonth] = useState(() => toMonthKey(new Date()));
  const lastMonth = addMonths(firstMonth, MAX_MONTHS_AHEAD);
  const [month, setMonth] = useState(firstMonth);
  const [date, setDate] = useState<string | null>(null);

  const treatmentQuery = useQuery({
    queryKey: adminTreatmentKey(booking.treatment_id),
    queryFn: () => fetchAdminTreatment(booking.treatment_id),
  });
  const therapistQuery = useQuery({
    queryKey: adminTherapistKey(booking.therapist_id),
    queryFn: () => fetchAdminTherapist(booking.therapist_id),
  });
  const treatment = treatmentQuery.data?.slug;
  const therapist = therapistQuery.data?.slug;
  const ready = !!treatment && !!therapist;

  const datesQuery = useQuery({
    queryKey: ["available-dates", treatment, therapist, month],
    queryFn: () => fetchAvailableDates(treatment!, therapist!, month),
    enabled: ready,
  });
  const slotsQuery = useQuery({
    queryKey: ["slots", treatment, therapist, date],
    queryFn: () => fetchSlots(treatment!, therapist!, date!),
    enabled: ready && date !== null,
    staleTime: 0,
  });

  const inactive =
    (treatmentQuery.data && !treatmentQuery.data.is_active) || (therapistQuery.data && !therapistQuery.data.is_active);
  const error = treatmentQuery.error ?? therapistQuery.error ?? datesQuery.error ?? slotsQuery.error;

  if (inactive) {
    return (
      <p className="rounded-md bg-warning-bg p-4 text-sm text-warning">
        Treatment atau terapis booking ini sudah nonaktif, sehingga jadwal baru tidak bisa dipilih.
      </p>
    );
  }

  if (error) {
    return (
      <QueryError
        error={error}
        onRetry={() => {
          treatmentQuery.refetch();
          therapistQuery.refetch();
          datesQuery.refetch();
          slotsQuery.refetch();
        }}
      />
    );
  }

  if (!ready) {
    return <Skeleton className="h-80" />;
  }

  const available = new Set(datesQuery.data ?? []);

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        locale={localeId}
        timeZone={TIME_ZONE}
        month={fromMonthKey(month)}
        onMonthChange={(value) => setMonth(toMonthKey(value))}
        startMonth={fromMonthKey(firstMonth)}
        endMonth={fromMonthKey(lastMonth)}
        selected={date ? fromDateKey(date) : undefined}
        onSelect={(value) => {
          setDate(value ? toDateKey(value) : null);
          onSelect(null);
        }}
        disabled={(day) => !available.has(toDateKey(day))}
        showOutsideDays={false}
        className="mx-auto w-full max-w-xs bg-transparent p-0 [--cell-size:--spacing(10)]"
        classNames={{ root: "w-full", disabled: "text-neutral-400 opacity-60" }}
      />

      {date && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700">{formatDateLong(date)}</p>
          {slotsQuery.isPending ? (
            <Skeleton className="h-11" />
          ) : (slotsQuery.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada jam kosong di tanggal ini.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slotsQuery.data!.map((slot) => (
                <button
                  key={slot.start_at}
                  type="button"
                  aria-pressed={selected === slot.start_at}
                  onClick={() => onSelect(slot.start_at)}
                  className={cn(
                    "h-10 rounded-md border text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected === slot.start_at
                      ? "border-sage-600 bg-sage-600 text-white"
                      : "border-neutral-300 bg-card hover:border-sage-600",
                  )}
                >
                  {slot.time.replace(":", ".")}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RescheduleDialog({ booking, pending, onReschedule }: RescheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  async function handleSubmit() {
    if (!selected) {
      return;
    }
    try {
      await onReschedule(selected);
      setOpen(false);
      setSelected(null);
    } catch {
      setSelected(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) {
          setOpen(value);
          setSelected(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Jadwalkan Ulang</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Jadwalkan ulang</DialogTitle>
          <DialogDescription>
            {booking.treatment_name} bersama {booking.therapist_name}. Pilih tanggal dan jam baru.
          </DialogDescription>
        </DialogHeader>
        {open && <ReschedulePicker booking={booking} selected={selected} onSelect={setSelected} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              Kembali
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!selected || pending}>
            {pending && <Loader2 aria-hidden="true" className="animate-spin" />}
            Simpan Jadwal Baru
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
