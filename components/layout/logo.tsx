import Link from "next/link";
import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string;
  label?: string;
};

export function Logo({ className, href = "/", label = "Lumière Aesthetic Clinic, ke beranda" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("inline-flex items-center gap-2 rounded-sm", className)}
    >
      <Sparkle aria-hidden="true" strokeWidth={1.75} className="size-6 fill-blush-300 text-blush-300" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-2xl text-sage-700">Lumière</span>
        <span className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-neutral-600">
          AESTHETIC CLINIC
        </span>
      </span>
    </Link>
  );
}
