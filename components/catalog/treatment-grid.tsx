import { Sparkles } from "lucide-react";
import { EmptyState } from "@/components/catalog/empty-state";
import { TreatmentCard } from "@/components/catalog/treatment-card";
import type { Treatment } from "@/lib/api/types";

export function TreatmentGrid({ treatments }: { treatments: Treatment[] }) {
  if (treatments.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Treatment belum tersedia"
        description="Daftar treatment sedang kami siapkan. Silakan kembali beberapa saat lagi."
      />
    );
  }

  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {treatments.map((treatment) => (
        <li key={treatment.id} className="flex [&>article]:w-full">
          <TreatmentCard treatment={treatment} />
        </li>
      ))}
    </ul>
  );
}
