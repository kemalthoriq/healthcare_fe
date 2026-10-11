"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, ImageIcon, Loader2 } from "lucide-react";
import { FormField, fieldDescribedBy } from "@/components/admin/form-field";
import { QueryError } from "@/components/query-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminTreatmentsKey, fetchAdminTreatments } from "@/lib/api/admin-catalog";
import type { PromoInput } from "@/lib/api/admin-promos";
import { applyApiError } from "@/lib/form-errors";
import { isOptimizableImage } from "@/lib/images";

const MAX_TREATMENTS = 20;
const dateKey = /^\d{4}-\d{2}-\d{2}$/;

const schema = z
  .object({
    title: z.string().trim().min(1, "Judul wajib diisi.").max(100, "Judul maksimal 100 karakter."),
    description: z.string().trim().max(2000, "Deskripsi maksimal 2000 karakter."),
    image_url: z
      .string()
      .trim()
      .max(500, "URL maksimal 500 karakter.")
      .refine((value) => value === "" || /^https:\/\/\S+$/.test(value), "URL harus diawali https://."),
    start_date: z.string().regex(dateKey, "Tanggal mulai wajib diisi."),
    end_date: z.string().regex(dateKey, "Tanggal selesai wajib diisi."),
    is_active: z.boolean(),
    treatment_ids: z.array(z.number()).max(MAX_TREATMENTS, `Maksimal ${MAX_TREATMENTS} treatment per promo.`),
  })
  .refine((value) => value.end_date >= value.start_date, {
    path: ["end_date"],
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
  });

const FIELDS = ["title", "description", "image_url", "start_date", "end_date", "is_active", "treatment_ids"] as const;

type PromoFormProps = {
  initial: PromoInput;
  submitLabel: string;
  resetAfterSubmit?: boolean;
  onSubmit: (values: PromoInput) => Promise<unknown>;
};

export function PromoForm({ initial, submitLabel, resetAfterSubmit = false, onSubmit }: PromoFormProps) {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<PromoInput>({ resolver: zodResolver(schema), defaultValues: initial });
  const { register, control, handleSubmit, setError, formState } = form;
  const errors = formState.errors;
  const imageUrl = useWatch({ control, name: "image_url" }) ?? "";
  const startDate = useWatch({ control, name: "start_date" });
  const treatmentsQuery = useQuery({ queryKey: adminTreatmentsKey, queryFn: fetchAdminTreatments });

  async function submit(values: PromoInput) {
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

      <FormField id={f("title")} label="Judul promo" error={errors.title?.message}>
        <Input
          id={f("title")}
          aria-invalid={!!errors.title}
          aria-describedby={fieldDescribedBy(f("title"), false, !!errors.title)}
          {...register("title")}
        />
      </FormField>

      <FormField
        id={f("description")}
        label="Deskripsi"
        optional
        help="Jelaskan potongan harga, syarat, atau bonus yang didapat pasien."
        error={errors.description?.message}
      >
        <Textarea
          id={f("description")}
          rows={4}
          maxLength={2000}
          aria-invalid={!!errors.description}
          aria-describedby={fieldDescribedBy(f("description"), true, !!errors.description)}
          {...register("description")}
        />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id={f("start_date")} label="Mulai" error={errors.start_date?.message}>
          <Input
            id={f("start_date")}
            type="date"
            aria-invalid={!!errors.start_date}
            aria-describedby={fieldDescribedBy(f("start_date"), false, !!errors.start_date)}
            {...register("start_date")}
          />
        </FormField>
        <FormField id={f("end_date")} label="Selesai" help="Promo tayang sampai akhir hari ini (WIB)." error={errors.end_date?.message}>
          <Input
            id={f("end_date")}
            type="date"
            min={startDate || undefined}
            aria-invalid={!!errors.end_date}
            aria-describedby={fieldDescribedBy(f("end_date"), true, !!errors.end_date)}
            {...register("end_date")}
          />
        </FormField>
      </div>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start">
        <FormField
          id={f("image_url")}
          label="URL gambar"
          optional
          help="Situs publik hanya menampilkan gambar dari res.cloudinary.com. Rasio 16:9 paling pas."
          error={errors.image_url?.message}
        >
          <Input
            id={f("image_url")}
            type="url"
            inputMode="url"
            placeholder="https://res.cloudinary.com/…"
            aria-invalid={!!errors.image_url}
            aria-describedby={fieldDescribedBy(f("image_url"), true, !!errors.image_url)}
            {...register("image_url")}
          />
        </FormField>
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700">Pratinjau</p>
          <div className="relative aspect-video overflow-hidden rounded-md bg-blush-100">
            {isOptimizableImage(imageUrl) ? (
              <Image src={imageUrl} alt="Pratinjau gambar promo" fill sizes="220px" className="object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-blush-400">
                <ImageIcon aria-hidden="true" strokeWidth={1.75} className="size-8" />
              </span>
            )}
          </div>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-neutral-700">
          Treatment terkait <span className="font-normal text-muted-foreground">(opsional, maks {MAX_TREATMENTS})</span>
        </legend>
        {treatmentsQuery.isError ? (
          <QueryError error={treatmentsQuery.error} onRetry={() => treatmentsQuery.refetch()} />
        ) : !treatmentsQuery.isSuccess ? (
          <Skeleton className="h-32" />
        ) : treatmentsQuery.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada treatment.</p>
        ) : (
          <Controller
            control={control}
            name="treatment_ids"
            render={({ field }) => (
              <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-md border border-border">
                {treatmentsQuery.data.map((treatment) => {
                  const checked = field.value.includes(treatment.id);
                  return (
                    <li key={treatment.id}>
                      <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 py-2 hover:bg-neutral-50">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            field.onChange(
                              value === true
                                ? [...field.value, treatment.id]
                                : field.value.filter((id) => id !== treatment.id),
                            )
                          }
                        />
                        <span className="flex-1 text-sm font-medium text-neutral-900">{treatment.name}</span>
                        {!treatment.is_active && <span className="text-xs text-muted-foreground">Nonaktif</span>}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          />
        )}
        {errors.treatment_ids?.message && <p className="text-sm text-danger">{errors.treatment_ids.message}</p>}
      </fieldset>

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
              <p className="text-sm text-muted-foreground">Promo nonaktif tidak tampil meskipun masih dalam periode.</p>
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
