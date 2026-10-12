"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/admin/bookings/confirm-action-dialog";
import { SectionCard } from "@/components/admin/section-card";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api/client";

type DeleteSectionProps = {
  entity: string;
  name: string;
  description?: string;
  onDelete: () => Promise<unknown>;
};

export function DeleteSection({
  entity,
  name,
  description = "Hanya bisa dihapus bila belum pernah dibooking. Bila sudah, nonaktifkan saja agar riwayat tetap utuh.",
  onDelete,
}: DeleteSectionProps) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      await onDelete();
    } catch (error) {
      toast.error(isApiError(error) ? error.message : `${entity} belum bisa dihapus. Silakan coba lagi.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard
      title={`Hapus ${entity.toLowerCase()}`}
      description={description}
      tone="danger"
    >
      <ConfirmActionDialog
        trigger={
          <Button variant="outline" className="border-danger/40 text-danger hover:bg-danger-bg">
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
            Hapus {entity}
          </Button>
        }
        title={`Hapus ${name}?`}
        description="Data yang dihapus tidak bisa dikembalikan."
        confirmLabel="Ya, Hapus"
        destructive
        pending={pending}
        onConfirm={handleDelete}
      />
    </SectionCard>
  );
}
