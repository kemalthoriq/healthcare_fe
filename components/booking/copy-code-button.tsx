"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyCodeButton({ code }: { code: string }) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Kode booking disalin.");
    } catch {
      toast.error("Kode belum bisa disalin. Silakan salin secara manual.");
    }
  }

  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Salin kode booking">
      <Copy strokeWidth={1.75} />
    </Button>
  );
}
