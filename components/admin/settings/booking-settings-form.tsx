"use client";

import { useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, Loader2 } from "lucide-react";
import { FormField, fieldDescribedBy } from "@/components/admin/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BookingSettingsInput } from "@/lib/api/admin-settings";
import { formatDuration } from "@/lib/format";
import { applyApiError } from "@/lib/form-errors";

const integer = (message: string) => z.number({ error: message }).int(message);

const schema = z.object({
  buffer_minutes: integer("Jeda wajib diisi.")
    .min(0, "Jeda harus 0–120 menit.")
    .max(120, "Jeda harus 0–120 menit.")
    .refine((value) => value % 5 === 0, "Jeda harus kelipatan 5 menit."),
  min_booking_lead_minutes: integer("Batas minimal wajib diisi.")
    .min(0, "Batas minimal harus 0–10080 menit.")
    .max(10080, "Batas minimal harus 0–10080 menit."),
  max_booking_days_ahead: integer("Batas maksimal wajib diisi.")
    .min(1, "Batas maksimal harus 1–365 hari.")
    .max(365, "Batas maksimal harus 1–365 hari."),
  cancel_deadline_hours: integer("Batas pembatalan wajib diisi.")
    .min(0, "Batas pembatalan harus 0–168 jam.")
    .max(168, "Batas pembatalan harus 0–168 jam."),
});

const FIELDS = ["buffer_minutes", "min_booking_lead_minutes", "max_booking_days_ahead", "cancel_deadline_hours"] as const;

type BookingSettingsFormProps = {
  initial: BookingSettingsInput;
  onSubmit: (values: BookingSettingsInput) => Promise<unknown>;
};

export function BookingSettingsForm({ initial, onSubmit }: BookingSettingsFormProps) {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<BookingSettingsInput>({ resolver: zodResolver(schema), defaultValues: initial });
  const { register, handleSubmit, setError, formState, control } = form;
  const errors = formState.errors;
  const lead = useWatch({ control, name: "min_booking_lead_minutes" });

  async function submit(values: BookingSettingsInput) {
    setFormError(null);
    try {
      await onSubmit(values);
      form.reset(values);
    } catch (error) {
      setFormError(applyApiError(error, setError, FIELDS));
    }
  }

  const fields: { name: (typeof FIELDS)[number]; label: string; unit: string; help: React.ReactNode; step: number }[] = [
    {
      name: "buffer_minutes",
      label: "Jeda antar booking",
      unit: "menit",
      step: 5,
      help: "Waktu persiapan ruangan setelah treatment selesai sebelum pasien berikutnya.",
    },
    {
      name: "min_booking_lead_minutes",
      label: "Minimal waktu booking",
      unit: "menit",
      step: 30,
      help: `Pasien hanya bisa memesan jam yang dimulai paling cepat ${Number.isFinite(lead) && lead > 0 ? formatDuration(lead) : "saat ini"} dari sekarang.`,
    },
    {
      name: "max_booking_days_ahead",
      label: "Maksimal booking ke depan",
      unit: "hari",
      step: 1,
      help: "Seberapa jauh ke depan jadwal bisa dipesan.",
    },
    {
      name: "cancel_deadline_hours",
      label: "Batas pembatalan oleh pasien",
      unit: "jam",
      step: 1,
      help: "Pasien bisa membatalkan sendiri sampai sekian jam sebelum jadwal. 24 = H-1.",
    },
  ];

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
      {formError && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" strokeWidth={1.75} />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        {fields.map((field) => {
          const id = f(field.name);
          const error = errors[field.name]?.message;
          return (
            <FormField key={field.name} id={id} label={field.label} help={field.help} error={error}>
              <div className="flex items-center gap-2">
                <Input
                  id={id}
                  type="number"
                  inputMode="numeric"
                  step={field.step}
                  min={0}
                  className="w-32"
                  aria-invalid={!!error}
                  aria-describedby={fieldDescribedBy(id, true, !!error)}
                  {...register(field.name, { valueAsNumber: true })}
                />
                <span className="text-sm text-neutral-700">{field.unit}</span>
              </div>
            </FormField>
          );
        })}
      </div>
      <Button type="submit" disabled={formState.isSubmitting || !formState.isDirty}>
        {formState.isSubmitting && <Loader2 aria-hidden="true" className="animate-spin" />}
        Simpan Aturan
      </Button>
    </form>
  );
}
