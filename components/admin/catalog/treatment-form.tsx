"use client";

import { useState, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, Loader2 } from "lucide-react";
import { FormField, fieldDescribedBy } from "@/components/admin/form-field";
import { ImageUpload } from "@/components/admin/image-upload";
import { RupiahInput } from "@/components/admin/rupiah-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TreatmentInput } from "@/lib/api/admin-catalog";
import { applyApiError } from "@/lib/form-errors";

const httpsUrl = z
  .string()
  .trim()
  .max(500, "URL maksimal 500 karakter.")
  .refine((value) => value === "" || /^https:\/\/\S+$/.test(value), "URL harus diawali https://.");

const schema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(100, "Nama maksimal 100 karakter."),
  description: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter."),
  image_url: httpsUrl,
  price: z
    .number({ error: "Harga wajib diisi." })
    .int()
    .min(0, "Harga tidak boleh negatif.")
    .max(100_000_000, "Harga maksimal Rp 100.000.000."),
  duration_minutes: z
    .number({ error: "Durasi wajib diisi." })
    .int()
    .min(15, "Durasi minimal 15 menit.")
    .max(480, "Durasi maksimal 480 menit.")
    .refine((value) => value % 5 === 0, "Durasi harus kelipatan 5 menit."),
  is_active: z.boolean(),
});

const FIELDS = ["name", "description", "image_url", "price", "duration_minutes", "is_active"] as const;

type TreatmentFormProps = {
  initial?: TreatmentInput;
  submitLabel: string;
  resetAfterSubmit?: boolean;
  onSubmit: (values: TreatmentInput) => Promise<unknown>;
};

const emptyTreatment: TreatmentInput = {
  name: "",
  description: "",
  image_url: "",
  price: 0,
  duration_minutes: 60,
  is_active: true,
};

export function TreatmentForm({ initial = emptyTreatment, submitLabel, resetAfterSubmit = false, onSubmit }: TreatmentFormProps) {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<TreatmentInput>({ resolver: zodResolver(schema), defaultValues: initial });
  const { register, control, handleSubmit, setError, formState } = form;
  const errors = formState.errors;

  async function submit(values: TreatmentInput) {
    setFormError(null);
    try {
      await onSubmit(values);
      form.reset(resetAfterSubmit ? undefined : values);
    } catch (error) {
      setFormError(applyApiError(error, setError, FIELDS));
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
      {formError && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" strokeWidth={1.75} />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FormField id={f("name")} label="Nama treatment" error={errors.name?.message}>
        <Input
          id={f("name")}
          aria-invalid={!!errors.name}
          aria-describedby={fieldDescribedBy(f("name"), false, !!errors.name)}
          {...register("name")}
        />
      </FormField>

      <FormField id={f("description")} label="Deskripsi" optional error={errors.description?.message}>
        <Textarea
          id={f("description")}
          rows={5}
          maxLength={2000}
          aria-invalid={!!errors.description}
          aria-describedby={fieldDescribedBy(f("description"), false, !!errors.description)}
          {...register("description")}
        />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id={f("price")} label="Harga" error={errors.price?.message}>
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <RupiahInput
                id={f("price")}
                ref={field.ref}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!errors.price}
                describedBy={fieldDescribedBy(f("price"), false, !!errors.price)}
              />
            )}
          />
        </FormField>

        <FormField id={f("duration_minutes")} label="Durasi (menit)" help="15–480 menit, kelipatan 5." error={errors.duration_minutes?.message}>
          <Input
            id={f("duration_minutes")}
            type="number"
            inputMode="numeric"
            min={15}
            max={480}
            step={5}
            aria-invalid={!!errors.duration_minutes}
            aria-describedby={fieldDescribedBy(f("duration_minutes"), true, !!errors.duration_minutes)}
            {...register("duration_minutes", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <Controller
        control={control}
        name="image_url"
        render={({ field }) => (
          <ImageUpload
            label="Gambar treatment"
            value={field.value}
            onChange={(value) => field.onChange(value)}
            folder="treatments"
            shape="landscape"
            hint="Rasio 4:3 paling pas."
            error={errors.image_url?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="is_active"
        render={({ field }) => (
          <div className="flex items-start gap-3 rounded-md border border-border p-4">
            <Switch id={f("is_active")} checked={field.value} onCheckedChange={field.onChange} ref={field.ref} />
            <div className="space-y-1">
              <label htmlFor={f("is_active")} className="text-sm font-medium text-neutral-900">
                Aktif
              </label>
              <p className="text-sm text-muted-foreground">
                Treatment nonaktif tidak tampil di situs dan tidak bisa dibooking.
              </p>
            </div>
          </div>
        )}
      />

      <Button type="submit" disabled={formState.isSubmitting || !formState.isDirty}>
        {formState.isSubmitting && <Loader2 aria-hidden="true" className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
