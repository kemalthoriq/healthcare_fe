"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_REASON = 200;

type CancelAdminDialogProps = {
  pending: boolean;
  onCancel: (reason: string) => Promise<unknown>;
};

export function CancelAdminDialog({ pending, onCancel }: CancelAdminDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = reason.trim();
    if (!value) {
      setError("Alasan pembatalan wajib diisi.");
      return;
    }
    setError("");
    try {
      await onCancel(value);
      setReason("");
    } finally {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !pending && setOpen(value)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-danger/40 text-danger hover:bg-danger-bg">
          Batalkan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Batalkan booking ini?</DialogTitle>
            <DialogDescription>
              Jam akan dilepas dan pasien perlu membuat booking baru. Alasan akan terlihat oleh pasien.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="admin-cancel-reason">Alasan</Label>
            <Textarea
              id="admin-cancel-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={MAX_REASON}
              rows={3}
              aria-invalid={!!error}
              aria-describedby={error ? "admin-cancel-reason-error" : undefined}
            />
            {error && (
              <p id="admin-cancel-reason-error" className="text-sm text-danger">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Kembali
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending && <Loader2 aria-hidden="true" className="animate-spin" />}
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
