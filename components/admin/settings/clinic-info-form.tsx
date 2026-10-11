"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, Loader2 } from "lucide-react";
import { FormField, fieldDescribedBy } from "@/components/admin/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ClinicInfoInput } from "@/lib/api/admin-settings";
import { applyApiError } from "@/lib/form-errors";

const schema = z.object({
  clinic_name: z.string().trim().min(1, "Nama klinik wajib diisi.").max(100, "Nama klinik maksimal 100 karakter."),
  address: z.string().trim().max(300, "Alamat maksimal 300 karakter."),
  phone: z.string().trim().max(30, "Nomor telepon maksimal 30 karakter."),
  whatsapp: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^(\+?62|0)?8\d{7,12}$/.test(value.replace(/[\s.()-]/g, "")),
      "Nomor WhatsApp belum sesuai. Contoh: 081234567890.",
    ),
  email: z
    .string()
    .trim()
    .max(254, "Email terlalu panjang.")
    .refine((value) => value === "" || z.email().safeParse(value).success, "Format email belum sesuai."),
  opening_hours_text: z.string().trim().max(500, "Jam operasional maksimal 500 karakter."),
});

const FIELDS = ["clinic_name", "address", "phone", "whatsapp", "email", "opening_hours_text"] as const;

type ClinicInfoFormProps = {
  initial: ClinicInfoInput;
  onSubmit: (values: ClinicInfoInput) => Promise<unknown>;
};

export function ClinicInfoForm({ initial, onSubmit }: ClinicInfoFormProps) {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ClinicInfoInput>({ resolver: zodResolver(schema), defaultValues: initial });
  const { register, handleSubmit, setError, formState } = form;
  const errors = formState.errors;

  async function submit(values: ClinicInfoInput) {
    setFormError(null);
    try {
      await onSubmit(values);
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
      <FormField id={f("clinic_name")} label="Nama klinik" error={errors.clinic_name?.message}>
        <Input
          id={f("clinic_name")}
          aria-invalid={!!errors.clinic_name}
          aria-describedby={fieldDescribedBy(f("clinic_name"), false, !!errors.clinic_name)}
          {...register("clinic_name")}
        />
      </FormField>
      <FormField id={f("address")} label="Alamat" optional error={errors.address?.message}>
        <Textarea
          id={f("address")}
          rows={3}
          maxLength={300}
          aria-invalid={!!errors.address}
          aria-describedby={fieldDescribedBy(f("address"), false, !!errors.address)}
          {...register("address")}
        />
      </FormField>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          id={f("whatsapp")}
          label="WhatsApp"
          optional
          help="Dipakai tombol 'Hubungi via WA' di situs."
          error={errors.whatsapp?.message}
        >
          <Input
            id={f("whatsapp")}
            type="tel"
            inputMode="tel"
            placeholder="081234567890"
            aria-invalid={!!errors.whatsapp}
            aria-describedby={fieldDescribedBy(f("whatsapp"), true, !!errors.whatsapp)}
            {...register("whatsapp")}
          />
        </FormField>
        <FormField id={f("phone")} label="Telepon" optional error={errors.phone?.message}>
          <Input
            id={f("phone")}
            type="tel"
            inputMode="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={fieldDescribedBy(f("phone"), false, !!errors.phone)}
            {...register("phone")}
          />
        </FormField>
      </div>
      <FormField id={f("email")} label="Email" optional error={errors.email?.message}>
        <Input
          id={f("email")}
          type="email"
          inputMode="email"
          aria-invalid={!!errors.email}
          aria-describedby={fieldDescribedBy(f("email"), false, !!errors.email)}
          {...register("email")}
        />
      </FormField>
      <FormField
        id={f("opening_hours_text")}
        label="Jam operasional"
        optional
        help="Ditampilkan apa adanya, satu baris per hari atau rentang. Contoh: Senin–Jumat 09.00–17.00 WIB"
        error={errors.opening_hours_text?.message}
      >
        <Textarea
          id={f("opening_hours_text")}
          rows={4}
          maxLength={500}
          aria-invalid={!!errors.opening_hours_text}
          aria-describedby={fieldDescribedBy(f("opening_hours_text"), true, !!errors.opening_hours_text)}
          {...register("opening_hours_text")}
        />
      </FormField>
      <Button type="submit" disabled={formState.isSubmitting || !formState.isDirty}>
        {formState.isSubmitting && <Loader2 aria-hidden="true" className="animate-spin" />}
        Simpan Info Klinik
      </Button>
    </form>
  );
}
