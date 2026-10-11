"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { FormField, fieldDescribedBy } from "@/components/admin/form-field";
import { discountError } from "@/components/admin/invoices/discount";
import { RupiahInput } from "@/components/admin/rupiah-input";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";

type DiscountFormProps = {
  initial: number;
  subtotal: number;
  pending: boolean;
  onSave: (discount: number) => Promise<unknown>;
};

export function DiscountForm({ initial, subtotal, pending, onSave }: DiscountFormProps) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const total = Number.isFinite(value) ? Math.max(0, subtotal - value) : subtotal;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = discountError(value, subtotal);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    await onSave(value).catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField id={id} label="Diskon" help={`Total setelah diskon: ${formatRupiah(total)}`} error={error}>
        <RupiahInput
          id={id}
          value={value}
          onChange={(next) => {
            setValue(next);
            setError("");
          }}
          invalid={!!error}
          describedBy={fieldDescribedBy(id, true, !!error)}
        />
      </FormField>
      <Button type="submit" size="sm" disabled={pending || value === initial}>
        {pending && <Loader2 aria-hidden="true" className="animate-spin" />}
        Simpan Diskon
      </Button>
    </form>
  );
}
