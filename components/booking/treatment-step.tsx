import { Clock, Sparkles } from "lucide-react";
import { ChoiceCard } from "@/components/booking/choice-card";
import { StepHeader } from "@/components/booking/step-header";
import { EmptyState } from "@/components/catalog/empty-state";
import type { Treatment } from "@/lib/api/types";
import { formatDuration, formatRupiah } from "@/lib/format";

type TreatmentStepProps = {
  treatments: Treatment[];
  selected: string | null;
  onSelect: (slug: string) => void;
};

export function TreatmentStep({ treatments, selected, onSelect }: TreatmentStepProps) {
  return (
    <div className="space-y-6">
      <StepHeader title="Pilih treatment" description="Satu booking berisi satu treatment." />
      {treatments.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Treatment belum tersedia"
          description="Booking online belum bisa dilakukan. Silakan kembali beberapa saat lagi."
        />
      ) : (
        <ul className="space-y-3">
          {treatments.map((treatment) => (
            <li key={treatment.id}>
              <ChoiceCard selected={selected === treatment.slug} onSelect={() => onSelect(treatment.slug)}>
                <span className="min-w-0 space-y-1">
                  <span className="block font-semibold text-neutral-900">{treatment.name}</span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock aria-hidden="true" strokeWidth={1.75} className="size-4" />
                      {formatDuration(treatment.duration_minutes)}
                    </span>
                    <span className="font-semibold text-neutral-900">{formatRupiah(treatment.price)}</span>
                  </span>
                </span>
              </ChoiceCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
