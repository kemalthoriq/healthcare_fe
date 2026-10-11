"use client";

import { useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, Copy, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { QueryError } from "@/components/query-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSchedules, saveSchedules, schedulesKey, type Shift } from "@/lib/api/admin-schedule";
import { isApiError } from "@/lib/api/client";
import { CLOCK_OPTIONS, WEEK_DAYS, clockLabel } from "@/lib/schedule";

type Row = { key: number; start: string; end: string };
type Week = Record<number, Row[]>;

let rowKey = 0;

function toWeek(shifts: Shift[]): Week {
  const week: Week = {};
  for (const { day } of WEEK_DAYS) {
    week[day] = shifts
      .filter((shift) => shift.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .map((shift) => ({ key: ++rowKey, start: shift.start_time, end: shift.end_time }));
  }
  return week;
}

function toShifts(week: Week): Shift[] {
  return WEEK_DAYS.flatMap(({ day }) =>
    week[day].map((row) => ({ day_of_week: day, start_time: row.start, end_time: row.end })),
  );
}

function sameShifts(a: Shift[], b: Shift[]): boolean {
  const key = (shifts: Shift[]) =>
    shifts
      .map((shift) => `${shift.day_of_week}-${shift.start_time}-${shift.end_time}`)
      .sort()
      .join("|");
  return key(a) === key(b);
}

function Editor({ therapistId, initial }: { therapistId: number; initial: Shift[] }) {
  const uid = useId();
  const queryClient = useQueryClient();
  const [week, setWeek] = useState<Week>(() => toWeek(initial));
  const [formError, setFormError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  const shifts = toShifts(week);
  const dirty = !sameShifts(shifts, initial);
  const invalidRows = WEEK_DAYS.flatMap(({ day }) => week[day]).filter((row) => row.end <= row.start);

  const mutation = useMutation({
    mutationFn: () => saveSchedules(therapistId, shifts),
    onSuccess: (saved) => {
      setFormError(null);
      setRowErrors({});
      queryClient.setQueryData(schedulesKey(therapistId), saved);
      toast.success("Jadwal kerja disimpan.");
    },
    onError: (error) => {
      if (!isApiError(error)) {
        setFormError("Jadwal belum tersimpan. Silakan coba lagi.");
        return;
      }
      const flat = WEEK_DAYS.flatMap(({ day }) => week[day]);
      const byRow: Record<number, string> = {};
      let general: string | null = error.code === "VALIDATION_ERROR" ? null : error.message;
      for (const [field, message] of Object.entries(error.fields)) {
        const match = /^shifts\[(\d+)\]$/.exec(field);
        const row = match ? flat[Number(match[1])] : undefined;
        if (row) {
          byRow[row.key] = message;
        } else {
          general = message;
        }
      }
      setRowErrors(byRow);
      setFormError(general);
    },
  });

  function update(day: number, rows: Row[]) {
    setWeek((current) => ({ ...current, [day]: rows }));
  }

  function addShift(day: number) {
    const rows = week[day];
    const last = rows.at(-1);
    const start = last ? last.end : "09:00";
    const startIndex = CLOCK_OPTIONS.indexOf(start);
    const end = CLOCK_OPTIONS[Math.min(startIndex + 8, CLOCK_OPTIONS.length - 1)];
    update(day, [...rows, { key: ++rowKey, start, end }]);
  }

  function copyMonday() {
    setWeek((current) => {
      const next = { ...current };
      for (const day of [2, 3, 4, 5]) {
        next[day] = current[1].map((row) => ({ ...row, key: ++rowKey }));
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" strokeWidth={1.75} />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <ul className="divide-y divide-border rounded-md border border-border">
        {WEEK_DAYS.map(({ day, label }) => (
          <li key={day} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-start sm:p-4">
            <p className="w-20 shrink-0 pt-2.5 text-sm font-semibold text-neutral-900">{label}</p>
            <div className="flex-1 space-y-2">
              {week[day].length === 0 && <p className="pt-2.5 text-sm text-muted-foreground">Libur</p>}
              {week[day].map((row, index) => {
                const startId = `${uid}-${day}-${row.key}-start`;
                const endId = `${uid}-${day}-${row.key}-end`;
                const error = rowErrors[row.key] ?? (row.end <= row.start ? "Jam selesai harus setelah jam mulai." : undefined);
                return (
                  <div key={row.key} className="space-y-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <label htmlFor={startId} className="sr-only">
                        Mulai shift {index + 1} hari {label}
                      </label>
                      <NativeSelect
                        id={startId}
                        value={row.start}
                        aria-invalid={!!error}
                        onChange={(event) =>
                          update(day, week[day].map((item) => (item.key === row.key ? { ...item, start: event.target.value } : item)))
                        }
                        className="min-w-0 flex-1 sm:w-32 sm:flex-none"
                      >
                        {CLOCK_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {clockLabel(value)}
                          </option>
                        ))}
                      </NativeSelect>
                      <span aria-hidden="true" className="text-neutral-500">
                        –
                      </span>
                      <label htmlFor={endId} className="sr-only">
                        Selesai shift {index + 1} hari {label}
                      </label>
                      <NativeSelect
                        id={endId}
                        value={row.end}
                        aria-invalid={!!error}
                        onChange={(event) =>
                          update(day, week[day].map((item) => (item.key === row.key ? { ...item, end: event.target.value } : item)))
                        }
                        className="min-w-0 flex-1 sm:w-32 sm:flex-none"
                      >
                        {CLOCK_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {clockLabel(value)}
                          </option>
                        ))}
                      </NativeSelect>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => update(day, week[day].filter((item) => item.key !== row.key))}
                        aria-label={`Hapus shift ${index + 1} hari ${label}`}
                      >
                        <X strokeWidth={1.75} />
                      </Button>
                    </div>
                    {error && <p className="text-sm text-danger">{error}</p>}
                  </div>
                );
              })}
              <Button type="button" variant="ghost" size="sm" onClick={() => addShift(day)} className="-ml-3">
                <Plus aria-hidden="true" strokeWidth={1.75} />
                Tambah shift
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={!dirty || invalidRows.length > 0 || mutation.isPending}
        >
          {mutation.isPending && <Loader2 aria-hidden="true" className="animate-spin" />}
          Simpan Jadwal
        </Button>
        <Button type="button" variant="outline" onClick={copyMonday} disabled={week[1].length === 0}>
          <Copy aria-hidden="true" strokeWidth={1.75} />
          Salin Senin ke Selasa–Jumat
        </Button>
        {dirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setWeek(toWeek(initial));
              setRowErrors({});
              setFormError(null);
            }}
          >
            Batalkan perubahan
          </Button>
        )}
      </div>
    </div>
  );
}

export function ScheduleEditor({ therapistId }: { therapistId: number }) {
  const query = useQuery({ queryKey: schedulesKey(therapistId), queryFn: () => fetchSchedules(therapistId) });

  if (query.isError) {
    return <QueryError error={query.error} onRetry={() => query.refetch()} />;
  }
  if (!query.isSuccess) {
    return <Skeleton className="h-96" />;
  }
  return <Editor key={JSON.stringify(query.data)} therapistId={therapistId} initial={query.data} />;
}
