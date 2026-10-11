import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="bg-sage-50">
      <div className="container-page flex flex-col items-start gap-6 py-16 md:py-24">
        <p className="text-overline text-sage-700">Klinik Kecantikan</p>
        <h1 className="text-display max-w-2xl text-neutral-900">
          Kulit sehat, perawatan yang menenangkan
        </h1>
        <p className="max-w-prose text-[17px] leading-relaxed text-muted-foreground lg:text-lg">
          Pilih treatment, terapis, dan jam yang Anda inginkan. Booking online hanya dalam beberapa
          menit.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/booking">Booking Sekarang</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/treatment">Lihat Treatment</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
