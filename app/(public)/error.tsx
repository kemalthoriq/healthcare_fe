"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="container-page flex flex-col items-center gap-6 py-24 text-center">
      <h1 className="type-h1 text-neutral-900">Halaman belum bisa dimuat</h1>
      <p className="max-w-prose text-muted-foreground">
        Terjadi gangguan saat mengambil data. Silakan coba lagi beberapa saat lagi.
      </p>
      <Button onClick={() => retry()}>
        <RefreshCw aria-hidden="true" strokeWidth={1.75} />
        Coba Lagi
      </Button>
    </div>
  );
}
