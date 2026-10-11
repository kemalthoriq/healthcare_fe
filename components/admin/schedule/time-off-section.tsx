"use client";

import { useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, CircleAlert, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/admin/bookings/confirm-action-dialog";
import { FormField, fieldDescribedBy } from "@/components/admin/form-field";
import { QueryError } from "@/components/query-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { createTimeOff, deleteTimeOff, fetchTimeOff, timeOffKey, type TimeOff } from "@/lib/api/admin-schedule";
import { isApiError } from "@/lib/api/client";
import { formatDateShort, formatTime } from "@/lib/format";
import { fromWibDateTimeLocal } from "@/lib/schedule";

type FieldErrors = Partial<Record<"start_at" | "end_at" | "reason", string>>;

function TimeOffRow({ therapistId, item }: { therapistId: number; item: TimeOff }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteTimeOff(therapistId, item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeOffKey(therapistId) });
      toast.success("Cuti dihapus.");
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : "Cuti belum bisa dihapus."),
  });

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <CalendarOff aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-neutral-500" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium text-neutral-900">
          {formatDateShort(item.start_at)}, {formatTime(item.start_at)} – {formatDateShort(item.end_at)},{" "}
          {formatTime(item.end_at)}
        </p>
        {item.reason && <p className="text-muted-foreground">{item.reason}</p>}
      </div>
      <ConfirmActionDialog
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label="Hapus cuti">
            <Trash2 strokeWidth={1.75} />
          </Button>
        }
        title="Hapus cuti ini?"
        description="Jam kerja terapis di rentang ini akan kembali bisa dibooking pasien."
        confirmLabel="Ya, Hapus"
        destructive
        pending={mutation.isPending}
        onConfirm={() => mutation.mutateAsync().catch(() => undefined)}
      />
    </li>
  );
}

function AddTimeOffForm({ therapistId }: { therapistId: number }) {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const queryClient = useQueryClient();
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createTimeOff(therapistId, {
        start_at: fromWibDateTimeLocal(startAt),
        end_at: fromWibDateTimeLocal(endAt),
        reason: reason.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timeOffKey(therapistId) });
      setStartAt("");
      setEndAt("");
      setReason("");
      setErrors({});
      setFormError(null);
      toast.success("Cuti ditambahkan.");
    },
    onError: (error) => {
      if (!isApiError(error)) {
        setFormError("Cuti belum tersimpan. Silakan coba lagi.");
        return;
      }
      if (error.code === "VALIDATION_ERROR") {
        setErrors(error.fields as FieldErrors);
        setFormError(null);
        return;
      }
      setFormError(error.message);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FieldErrors = {};
    if (!startAt) {
      next.start_at = "Waktu mulai wajib diisi.";
    }
    if (!endAt) {
      next.end_at = "Waktu selesai wajib diisi.";
    } else if (startAt && endAt <= startAt) {
      next.end_at = "Waktu selesai harus setelah waktu mulai.";
    }
    setErrors(next);
    if (Object.keys(next).length === 0) {
      mutation.mutate();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" strokeWidth={1.75} />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={f("start")} label="Mulai (WIB)" error={errors.start_at}>
          <Input
            id={f("start")}
            type="datetime-local"
            step={1800}
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            aria-invalid={!!errors.start_at}
            aria-describedby={fieldDescribedBy(f("start"), false, !!errors.start_at)}
          />
        </FormField>
        <FormField id={f("end")} label="Selesai (WIB)" error={errors.end_at}>
          <Input
            id={f("end")}
            type="datetime-local"
            step={1800}
            min={startAt || undefined}
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
            aria-invalid={!!errors.end_at}
            aria-describedby={fieldDescribedBy(f("end"), false, !!errors.end_at)}
          />
        </FormField>
      </div>
      <FormField id={f("reason")} label="Alasan" optional error={errors.reason}>
        <Input
          id={f("reason")}
          value={reason}
          maxLength={200}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Mis. cuti tahunan, pelatihan"
          aria-invalid={!!errors.reason}
          aria-describedby={fieldDescribedBy(f("reason"), false, !!errors.reason)}
        />
      </FormField>
      <Button type="submit" variant="outline" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 aria-hidden="true" className="animate-spin" />}
        Tambah Cuti
      </Button>
    </form>
  );
}

export function TimeOffSection({ therapistId }: { therapistId: number }) {
  const query = useQuery({ queryKey: timeOffKey(therapistId), queryFn: () => fetchTimeOff(therapistId) });

  return (
    <div className="space-y-6">
      {query.isError ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : !query.isSuccess ? (
        <Skeleton className="h-20" />
      ) : query.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Tidak ada cuti yang akan datang.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {query.data.map((item) => (
            <TimeOffRow key={item.id} therapistId={therapistId} item={item} />
          ))}
        </ul>
      )}
      <AddTimeOffForm therapistId={therapistId} />
    </div>
  );
}
