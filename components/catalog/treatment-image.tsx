import Image from "next/image";
import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";
import { isOptimizableImage } from "@/lib/images";

type TreatmentImageProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function TreatmentImage({ src, alt, sizes, priority, className }: TreatmentImageProps) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden bg-sage-50", className)}>
      {isOptimizableImage(src) ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div
          aria-hidden="true"
          className="flex size-full items-center justify-center bg-gradient-to-br from-sage-50 via-sage-100 to-blush-50"
        >
          <Sparkle strokeWidth={1.75} className="size-10 text-sage-300" />
        </div>
      )}
    </div>
  );
}
