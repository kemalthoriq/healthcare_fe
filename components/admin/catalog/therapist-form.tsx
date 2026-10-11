"use client";

import { useState, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, Loader2 } from "lucide-react";
import { FormField, fieldDescribedBy } from "@/components/admin/form-field";
import { ImageUpload } from "@/components/admin/image-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TherapistInput } from "@/lib/api/admin-catalog";
import { applyApiError } from "@/lib/form-errors";

const schema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(100, "Nama maksimal 100 karakter."),
  title: z.string().trim().max(100, "Gelar maksimal 100 karakter."),
  bio: z.string().trim().max(2000, "Bio maksimal 2000 karakter."),
  photo_url: z
    .string()
    .trim()
    .max(500, "URL maksimal 500 karakter.")
    .refine((value) => value === "" || /^https:\/\/\S+$/.test(value), "URL harus diawali https://."),
  is_active: z.boolean(),
});

const FIELDS = ["name", "title", "bio", "photo_url", "is_active"] as const;

const emptyTherapist: TherapistInput = { name: "", title: "", bio: "", photo_url: "", is_active: true };

type TherapistFormProps = {
  initial?: TherapistInput;
  submitLabel: string;
  resetAfterSubmit?: boolean;
  onSubmit: (values: TherapistInput) => Promise<unknown>;
};

export function TherapistForm({ initial = emptyTherapist, submitLabel, resetAfterSubmit = false, onSubmit }: TherapistFormProps) {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<TherapistInput>({ resolver: zodResolver(schema), defaultValues: initial });
  const { register, control, handleSubmit, setError, formState } = form;
  const errors = formState.errors;

  async function submit(values: TherapistInput) {
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

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id={f("name")} label="Nama" help="Sertakan sapaan bila perlu, mis. dr. Sinta" error={errors.name?.message}>
          <Input
            id={f("name")}
            aria-invalid={!!errors.name}
            aria-describedby={fieldDescribedBy(f("name"), true, !!errors.name)}
            {...register("name")}
          />
        </FormField>
        <FormField id={f("title")} label="Gelar / jabatan" optional help="Mis. Dokter Estetika, Terapis Senior" error={errors.title?.message}>
          <Input
            id={f("title")}
            aria-invalid={!!errors.title}
            aria-describedby={fieldDescribedBy(f("title"), true, !!errors.title)}
            {...register("title")}
          />
        </FormField>
      </div>

      <FormField id={f("bio")} label="Bio" optional error={errors.bio?.message}>
        <Textarea
          id={f("bio")}
          rows={4}
          maxLength={2000}
          aria-invalid={!!errors.bio}
          aria-describedby={fieldDescribedBy(f("bio"), false, !!errors.bio)}
          {...register("bio")}
        />
      </FormField>

      <Controller
        control={control}
        name="photo_url"
        render={({ field }) => (
          <ImageUpload
            label="Foto terapis"
            value={field.value}
            onChange={(value) => field.onChange(value)}
            folder="therapists"
            shape="circle"
            hint="Foto persegi (1:1) paling pas."
            error={errors.photo_url?.message}
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
                Terapis nonaktif tidak tampil di situs dan tidak bisa dipilih saat booking.
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
