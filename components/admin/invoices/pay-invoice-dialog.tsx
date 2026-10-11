"use client";

import { useId, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { paymentMethodLabel, type PaymentMethod } from "@/lib/api/admin-invoices";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

const METHODS = Object.keys(paymentMethodLabel) as PaymentMethod[];

type PayInvoiceDialogProps = {
  total: number;
  pending: boolean;
  disabled?: boolean;
  onPay: (method: PaymentMethod) => Promise<unknown>;
};

export function PayInvoiceDialog({ total, pending, disabled, onPay }: PayInvoiceDialogProps) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState("");

  function changeOpen(value: boolean) {
    if (pending) {
      return;
    }
    setOpen(value);
    if (value) {
      setMethod(null);
      setError("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!method) {
      setError("Pilih metode pembayaran.");
      return;
    }
    try {
      await onPay(method);
    } finally {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Wallet aria-hidden="true" strokeWidth={1.75} />
          Catat Pembayaran
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Catat pembayaran {formatRupiah(total)}?</DialogTitle>
            <DialogDescription>Invoice menjadi lunas dan tidak bisa diubah lagi setelah ini.</DialogDescription>
          </DialogHeader>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-neutral-900">Metode pembayaran</legend>
            <div className="grid grid-cols-2 gap-3">
              {METHODS.map((value) => (
                <label
                  key={value}
                  className={cn(
                    "flex h-11 cursor-pointer items-center gap-2 rounded-md border px-3.5 text-sm font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
                    method === value
                      ? "border-sage-600 bg-sage-50 text-sage-800"
                      : "border-neutral-300 bg-card text-neutral-700 hover:border-sage-600",
                  )}
                >
                  <input
                    type="radio"
                    name={`${uid}-method`}
                    value={value}
                    checked={method === value}
                    onChange={() => {
                      setMethod(value);
                      setError("");
                    }}
                    aria-describedby={error ? `${uid}-error` : undefined}
                    className="accent-sage-600"
                  />
                  {paymentMethodLabel[value]}
                </label>
              ))}
            </div>
            {error && (
              <p id={`${uid}-error`} className="text-sm text-danger">
                {error}
              </p>
            )}
          </fieldset>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Kembali
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 aria-hidden="true" className="animate-spin" />}
              Ya, Tandai Lunas
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
