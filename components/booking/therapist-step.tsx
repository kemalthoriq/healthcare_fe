import { Users } from "lucide-react";
import { ChoiceCard } from "@/components/booking/choice-card";
import { QueryError } from "@/components/booking/query-error";
import { StepHeader } from "@/components/booking/step-header";
import { EmptyState } from "@/components/catalog/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Therapist } from "@/lib/api/types";
import { initials } from "@/lib/initials";

type TherapistStepProps = {
  therapists: Therapist[] | undefined;
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
  selected: string | null;
  onSelect: (slug: string) => void;
  onBack: () => void;
};

export function TherapistStep({ therapists, isPending, error, onRetry, selected, onSelect, onBack }: TherapistStepProps) {
  return (
    <div className="space-y-6">
      <StepHeader title="Pilih terapis" description="Hanya terapis yang menangani treatment ini." onBack={onBack} />
      {isPending ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat terapis">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      ) : error ? (
        <QueryError error={error} onRetry={onRetry} />
      ) : !therapists || therapists.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada terapis"
          description="Belum ada terapis yang dijadwalkan untuk treatment ini. Silakan pilih treatment lain."
        />
      ) : (
        <ul className="space-y-3">
          {therapists.map((therapist) => (
            <li key={therapist.id}>
              <ChoiceCard selected={selected === therapist.slug} onSelect={() => onSelect(therapist.slug)}>
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sage-100 font-display text-lg text-sage-700"
                >
                  {initials(therapist.name)}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-neutral-900">{therapist.name}</span>
                  {therapist.title && (
                    <span className="block text-sm text-muted-foreground">{therapist.title}</span>
                  )}
                </span>
              </ChoiceCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
