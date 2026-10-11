import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Promo } from "@/lib/api/types";
import { formatDateRange } from "@/lib/format";
import { isOptimizableImage } from "@/lib/images";
import { cn } from "@/lib/utils";

export function PromoCard({ promo, compact = false }: { promo: Promo; compact?: boolean }) {
  const treatments = promo.treatments.filter((treatment) => treatment.is_active);
  const bookingHref = treatments.length === 1 ? `/booking?treatment=${treatments[0].slug}` : "/booking";

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-blush-200 bg-blush-100">
      {isOptimizableImage(promo.image_url) && (
        <div className="relative aspect-video">
          <Image
            src={promo.image_url}
            alt={promo.title}
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="type-overline text-blush-600">Promo</p>
        <h3 className="text-xl leading-[1.3] font-semibold text-neutral-900 lg:text-[22px]">{promo.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-neutral-700">
          <CalendarDays aria-hidden="true" strokeWidth={1.75} className="size-4" />
          Berlaku {formatDateRange(promo.start_date, promo.end_date)}
        </p>
        {promo.description && (
          <p className={cn("leading-relaxed whitespace-pre-line text-neutral-700", compact && "line-clamp-3")}>
            {promo.description}
          </p>
        )}
        {treatments.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Treatment terkait">
            {treatments.map((treatment) => (
              <li key={treatment.id}>
                <Link
                  href={`/treatment/${treatment.slug}`}
                  className="inline-flex rounded-full border border-blush-200 bg-card px-3 py-1 text-sm text-neutral-700 hover:border-blush-400"
                >
                  {treatment.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-2">
          <Button asChild size="sm">
            <Link href={bookingHref}>Booking Sekarang</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
