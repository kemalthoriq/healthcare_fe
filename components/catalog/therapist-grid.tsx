import { Users } from "lucide-react";
import { EmptyState } from "@/components/catalog/empty-state";
import { TherapistCard } from "@/components/catalog/therapist-card";
import type { Therapist } from "@/lib/api/types";

type TherapistGridProps = {
  therapists: Therapist[];
  showBio?: boolean;
  emptyDescription?: string;
};

export function TherapistGrid({
  therapists,
  showBio = false,
  emptyDescription = "Profil tim kami sedang disiapkan.",
}: TherapistGridProps) {
  if (therapists.length === 0) {
    return <EmptyState icon={Users} title="Belum ada terapis" description={emptyDescription} />;
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {therapists.map((therapist) => (
        <li key={therapist.id} className="flex [&>article]:w-full">
          <TherapistCard therapist={therapist} showBio={showBio} />
        </li>
      ))}
    </ul>
  );
}
