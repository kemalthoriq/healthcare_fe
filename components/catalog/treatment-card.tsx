import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreatmentImage } from "@/components/catalog/treatment-image";
import type { Treatment } from "@/lib/api/types";
import { formatDuration, formatRupiah } from "@/lib/format";

export function TreatmentCard({ treatment }: { treatment: Treatment }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg bg-card shadow-sm transition-shadow duration-150 hover:shadow-md">
      <TreatmentImage
        src={treatment.image_url}
        alt={treatment.name}
        sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
      />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-xl leading-[1.3] font-semibold lg:text-[22px]">
          <Link
            href={`/treatment/${treatment.slug}`}
            className="rounded-sm after:absolute after:inset-0 hover:text-sage-700"
          >
            {treatment.name}
          </Link>
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock aria-hidden="true" strokeWidth={1.75} className="size-4" />
          {formatDuration(treatment.duration_minutes)}
        </p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-2">
          <p className="text-lg font-semibold text-neutral-900">{formatRupiah(treatment.price)}</p>
          <Button asChild size="sm" className="relative z-10">
            <Link href={`/booking?treatment=${treatment.slug}`} aria-label={`Booking ${treatment.name}`}>
              Booking
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
