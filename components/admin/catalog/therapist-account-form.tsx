"use client";

import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, CircleCheck, Copy, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FormField, fieldDescribedBy } from "@/components/admin/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyApiError } from "@/lib/form-errors";

const schema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi.").pipe(z.email("Format email belum sesuai.")),
  password: z.string().min(12, "Password minimal 12 karakter."),
});

type AccountValues = z.infer<typeof schema>;

const FIELDS = ["email", "password"] as const;
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function generatePassword(): string {
  const bytes = new Uint32Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]).join("");
}

type TherapistAccountFormProps = {
  hasAccount: boolean;
  onCreate: (email: string, password: string) => Promise<unknown>;
};

export function TherapistAccountForm({ hasAccount, onCreate }: TherapistAccountFormProps) {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<AccountValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const { register, handleSubmit, setError, setValue, getValues, formState } = form;
  const errors = formState.errors;

  if (hasAccount) {
    return (
      <p className="flex items-center gap-2 text-sm text-neutral-700">
        <CircleCheck aria-hidden="true" strokeWidth={1.75} className="size-5 text-success" />
        Terapis ini sudah memiliki akun login.
      </p>
    );
  }

  async function submit(values: AccountValues) {
    setFormError(null);
    try {
      await onCreate(values.email, values.password);
    } catch (error) {
      setFormError(applyApiError(error, setError, FIELDS));
    }
  }

  async function copyPassword() {
    const value = getValues("password");
    if (!value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Password disalin.");
    } catch {
      toast.error("Password belum bisa disalin.");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      {formError && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" strokeWidth={1.75} />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <FormField id={f("account-email")} label="Email login" error={errors.email?.message}>
        <Input
          id={f("account-email")}
          type="email"
          autoComplete="off"
          aria-invalid={!!errors.email}
          aria-describedby={fieldDescribedBy(f("account-email"), false, !!errors.email)}
          {...register("email")}
        />
      </FormField>
      <FormField
        id={f("account-password")}
        label="Password awal"
        help="Minimal 12 karakter. Sampaikan ke terapis lewat jalur pribadi; password tidak bisa dilihat lagi setelah disimpan."
        error={errors.password?.message}
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={f("account-password")}
            type="text"
            autoComplete="new-password"
            spellCheck={false}
            className="font-mono"
            aria-invalid={!!errors.password}
            aria-describedby={fieldDescribedBy(f("account-password"), true, !!errors.password)}
            {...register("password")}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setValue("password", generatePassword(), { shouldDirty: true, shouldValidate: true })}
            >
              <RefreshCw aria-hidden="true" strokeWidth={1.75} />
              Buat acak
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={copyPassword} aria-label="Salin password">
              <Copy strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      </FormField>
      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <Loader2 aria-hidden="true" className="animate-spin" />}
        Buat Akun
      </Button>
    </form>
  );
}
