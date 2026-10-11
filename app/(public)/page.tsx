import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/catalog/section-heading";
import { TherapistGrid } from "@/components/catalog/therapist-grid";
import { TreatmentGrid } from "@/components/catalog/treatment-grid";
import { WhyUs } from "@/components/catalog/why-us";
import { PromoCard } from "@/components/catalog/promo-card";
import { getPromos, getTherapists, getTreatments } from "@/lib/api/catalog";

const FEATURED_TREATMENTS = 6;
const FEATURED_THERAPISTS = 4;
const FEATURED_PROMOS = 2;

export default async function HomePage() {
  const [treatments, therapists, promos] = await Promise.all([getTreatments(), getTherapists(), getPromos()]);

  return (
    <>
      <section className="bg-sage-50">
        <div className="container-page flex flex-col items-start gap-6 py-16 md:py-24">
          <p className="type-overline text-sage-700">Klinik Kecantikan</p>
          <h1 className="type-display max-w-2xl text-neutral-900">
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

      {promos.length > 0 && (
        <section className="bg-blush-50 py-12 lg:py-20">
          <div className="container-page space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading overline="Promo" title="Promo yang sedang berlaku" />
              {promos.length > FEATURED_PROMOS && (
                <Link
                  href="/promo"
                  className="inline-flex items-center gap-1.5 rounded-sm font-semibold text-sage-700 hover:underline"
                >
                  Semua promo
                  <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
                </Link>
              )}
            </div>
            <ul className="grid gap-6 md:grid-cols-2">
              {promos.slice(0, FEATURED_PROMOS).map((promo) => (
                <li key={promo.id} className="flex [&>article]:w-full">
                  <PromoCard promo={promo} compact />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-background py-12 lg:py-20">
        <div className="container-page space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              overline="Treatment"
              title="Treatment pilihan"
              description="Perawatan wajah dan kulit yang paling sering dipilih pasien kami."
            />
            {treatments.length > FEATURED_TREATMENTS && (
              <Link
                href="/treatment"
                className="inline-flex items-center gap-1.5 rounded-sm font-semibold text-sage-700 hover:underline"
              >
                Semua treatment
                <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
              </Link>
            )}
          </div>
          <TreatmentGrid treatments={treatments.slice(0, FEATURED_TREATMENTS)} />
        </div>
      </section>

      <section className="bg-card py-12 lg:py-20">
        <div className="container-page space-y-10">
          <SectionHeading overline="Kenapa Lumière" title="Kenapa memilih kami" />
          <WhyUs />
        </div>
      </section>

      <section className="bg-blush-50 py-12 lg:py-20">
        <div className="container-page space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              overline="Tim Kami"
              title="Dokter & terapis"
              description="Ditangani tenaga berpengalaman yang siap mendampingi perawatan Anda."
            />
            {therapists.length > 0 && (
              <Link
                href="/tentang"
                className="inline-flex items-center gap-1.5 rounded-sm font-semibold text-sage-700 hover:underline"
              >
                Kenali tim kami
                <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
              </Link>
            )}
          </div>
          <TherapistGrid therapists={therapists.slice(0, FEATURED_THERAPISTS)} />
        </div>
      </section>

      <section className="bg-sage-600 py-12 text-white lg:py-20">
        <div className="container-page flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h2 className="type-h2">Siap merawat kulit Anda?</h2>
            <p className="max-w-prose text-sage-50">
              Pilih jam yang paling nyaman untuk Anda dan simpan kode booking untuk mengecek statusnya.
            </p>
          </div>
          <Button asChild size="lg" className="bg-white text-sage-700 hover:bg-sage-50">
            <Link href="/booking">Booking Sekarang</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
