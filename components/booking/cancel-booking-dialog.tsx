"use client";

import { useState, useId } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { cancelBooking } from "@/lib/api/booking";
import { isApiError } from "@/lib/api/client";

export function CancelBookingDialog({ code }: { code: string }) {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: () => cancelBooking(code, reason.trim()),
    onSuccess: () => {
      toast.success("Booking Anda telah dibatalkan.");
      setOpen(false);
      router.replace(pathname);
      router.refresh();
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : "Pembatalan belum berhasil. Silakan coba lagi.");
      setOpen(false);
      router.replace(pathname);
      router.refresh();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(value) => !mutation.isPending && setOpen(value)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-danger/40 text-danger hover:bg-danger-bg">
          Batalkan Booking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batalkan booking ini?</DialogTitle>
          <DialogDescription>
            Jam yang sudah Anda pilih akan dilepas dan bisa dipesan orang lain. Tindakan ini tidak bisa
            dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={f("cancel-reason")}>
            Alasan <span className="font-normal text-muted-foreground">(opsional)</span>
          </Label>
          <Textarea
            id={f("cancel-reason")}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={200}
            rows={3}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={mutation.isPending}>
              Kembali
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 aria-hidden="true" className="animate-spin" />}
            Ya, Batalkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
