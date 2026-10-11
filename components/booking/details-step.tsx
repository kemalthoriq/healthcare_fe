"use client";

import { useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, Loader2 } from "lucide-react";
import { StepHeader } from "@/components/booking/step-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MAX_NAME = 100;
const MAX_NOTE = 500;

export const detailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(MAX_NAME, `Nama maksimal ${MAX_NAME} karakter.`),
  phone: z
    .string()
    .transform((value) => value.replace(/[\s.()-]/g, "").replace(/^(\+?62|0)/, ""))
    .pipe(z.string().regex(/^8\d{7,12}$/, "Nomor WhatsApp belum sesuai. Contoh: 81234567890.")),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, "Format email belum sesuai."),
  note: z.string().trim().max(MAX_NOTE, `Catatan maksimal ${MAX_NOTE} karakter.`),
  consent: z.boolean().refine((value) => value, "Persetujuan penggunaan data wajib dicentang."),
});

export type DetailsInput = z.input<typeof detailsSchema>;
export type DetailsValues = z.output<typeof detailsSchema>;

export const emptyDetails: DetailsInput = { name: "", phone: "", email: "", note: "", consent: false };

export type DetailsField = keyof DetailsInput;

type DetailsStepProps = {
  defaultValues: DetailsInput;
  serverErrors: Partial<Record<DetailsField, string>>;
  submitting: boolean;
  onChange: (values: DetailsInput) => void;
  onSubmit: (values: DetailsValues) => void;
  onBack: () => void;
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-danger">
      <CircleAlert aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

export function DetailsStep({ defaultValues, serverErrors, submitting, onChange, onSubmit, onBack }: DetailsStepProps) {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const form = useForm<DetailsInput, unknown, DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues,
  });
  const { register, control, handleSubmit, setError, formState, subscribe } = form;
  const errors = formState.errors;

  useEffect(() => {
    return subscribe({
      formState: { values: true },
      callback: ({ values }) => onChange({ ...emptyDetails, ...values }),
    });
  }, [subscribe, onChange]);

  useEffect(() => {
    let focused = false;
    for (const [field, message] of Object.entries(serverErrors) as [DetailsField, string][]) {
      setError(field, { type: "server", message }, { shouldFocus: !focused });
      focused = true;
    }
  }, [serverErrors, setError]);

  const describedBy = (field: DetailsField, help?: string) =>
    [help, errors[field] ? f(`${field}-error`) : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <StepHeader
        title="Isi data diri"
        description="Kami memakai data ini untuk menghubungi Anda terkait booking."
        onBack={onBack}
      />

      <div className="space-y-2">
        <Label htmlFor={f("name")}>Nama lengkap</Label>
        <Input
          id={f("name")}
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("name")}
          {...register("name")}
        />
        <FieldError id={f("name-error")} message={errors.name?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={f("phone")}>Nomor WhatsApp</Label>
        <div
          className={cn(
            "flex h-11 items-stretch overflow-hidden rounded-md border border-input bg-card shadow-xs transition-colors focus-within:border-sage-600 focus-within:ring-3 focus-within:ring-sage-100",
            errors.phone && "border-destructive",
          )}
        >
          <span className="flex items-center border-r border-input bg-neutral-100 px-3 text-base text-neutral-700">
            +62
          </span>
          <input
            id={f("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="81234567890"
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone", f("phone-help"))}
            className="min-w-0 flex-1 bg-transparent px-3.5 text-base outline-none placeholder:text-neutral-400"
            {...register("phone")}
          />
        </div>
        <p id={f("phone-help")} className="text-sm text-muted-foreground">
          Nomor ini menjadi identitas Anda di klinik.
        </p>
        <FieldError id={f("phone-error")} message={errors.phone?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={f("email")}>
          Email <span className="font-normal text-muted-foreground">(opsional)</span>
        </Label>
        <Input
          id={f("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("email", f("email-help"))}
          {...register("email")}
        />
        <p id={f("email-help")} className="text-sm text-muted-foreground">
          Agar klinik bisa menghubungi Anda lewat email.
        </p>
        <FieldError id={f("email-error")} message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={f("note")}>
          Catatan <span className="font-normal text-muted-foreground">(opsional)</span>
        </Label>
        <Textarea
          id={f("note")}
          rows={3}
          maxLength={MAX_NOTE}
          placeholder="Keluhan kulit, alergi, atau hal lain yang perlu kami ketahui"
          aria-invalid={!!errors.note}
          aria-describedby={describedBy("note")}
          {...register("note")}
        />
        <FieldError id={f("note-error")} message={errors.note?.message} />
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Controller
            control={control}
            name="consent"
            render={({ field }) => (
              <Checkbox
                id={f("consent")}
                ref={field.ref}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                aria-invalid={!!errors.consent}
                aria-describedby={describedBy("consent")}
                className="mt-0.5"
              />
            )}
          />
          <Label htmlFor={f("consent")} className="text-sm leading-relaxed font-normal text-neutral-700">
            Saya setuju data saya digunakan klinik untuk keperluan booking dan riwayat perawatan.
          </Label>
        </div>
        <FieldError id={f("consent-error")} message={errors.consent?.message} />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
        {submitting && <Loader2 aria-hidden="true" className="animate-spin" />}
        Kirim Booking
      </Button>
    </form>
  );
}
