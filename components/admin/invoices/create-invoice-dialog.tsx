"use client";

import { useId, useState } from "react";
import { Loader2, ReceiptText } from "lucide-react";
import { FormField, fieldDescribedBy } from "@/components/admin/form-field";
import { discountError } from "@/components/admin/invoices/discount";
import { RupiahInput } from "@/components/admin/rupiah-input";
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
import { formatRupiah } from "@/lib/format";

type CreateInvoiceDialogProps = {
  subtotal: number;
  pending: boolean;
  onCreate: (discount: number) => Promise<unknown>;
};

export function CreateInvoiceDialog({ subtotal, pending, onCreate }: CreateInvoiceDialogProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");
  const total = Number.isFinite(discount) ? Math.max(0, subtotal - discount) : subtotal;

  function changeOpen(value: boolean) {
    if (pending) {
      return;
    }
    setOpen(value);
    if (value) {
      setDiscount(0);
      setError("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = discountError(discount, subtotal);
    if (message) {
      setError(message);
      return;
    }
    try {
      await onCreate(discount);
    } finally {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button>
          <ReceiptText aria-hidden="true" strokeWidth={1.75} />
          Buat Invoice
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Buat invoice</DialogTitle>
            <DialogDescription>
              Subtotal {formatRupiah(subtotal)} dari harga booking. Diskon masih bisa diubah sebelum invoice lunas.
            </DialogDescription>
          </DialogHeader>
          <FormField id={id} label="Diskon" help={`Total: ${formatRupiah(total)}`} error={error}>
            <RupiahInput
              id={id}
              value={discount}
              onChange={(value) => {
                setDiscount(value);
                setError("");
              }}
              invalid={!!error}
              describedBy={fieldDescribedBy(id, true, !!error)}
            />
          </FormField>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Kembali
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 aria-hidden="true" className="animate-spin" />}
              Buat Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
