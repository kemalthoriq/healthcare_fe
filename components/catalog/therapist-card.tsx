import Image from "next/image";
import type { Therapist } from "@/lib/api/types";
import { isOptimizableImage } from "@/lib/images";
import { initials } from "@/lib/initials";

export function TherapistCard({ therapist, showBio = false }: { therapist: Therapist; showBio?: boolean }) {
  return (
    <article className="flex flex-col items-center gap-3 rounded-lg bg-card p-4 text-center shadow-sm sm:p-6">
      <div className="relative aspect-square w-full max-w-36 overflow-hidden rounded-full bg-sage-100">
        {isOptimizableImage(therapist.photo_url) ? (
          <Image
            src={therapist.photo_url}
            alt={`Foto ${therapist.name}`}
            fill
            sizes="144px"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center font-display text-3xl text-sage-700"
          >
            {initials(therapist.name)}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-[17px] leading-[1.4] font-semibold lg:text-lg">{therapist.name}</h3>
        {therapist.title && <p className="text-sm text-muted-foreground">{therapist.title}</p>}
      </div>
      {showBio && therapist.bio && (
        <p className="text-sm leading-relaxed whitespace-pre-line text-neutral-700">{therapist.bio}</p>
      )}
    </article>
  );
}
