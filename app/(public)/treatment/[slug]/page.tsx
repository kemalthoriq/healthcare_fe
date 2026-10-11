import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TherapistGrid } from "@/components/catalog/therapist-grid";
import { TreatmentImage } from "@/components/catalog/treatment-image";
import { getTreatment, getTreatmentTherapists } from "@/lib/api/catalog";
import { formatDuration, formatRupiah } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/treatment/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const treatment = await getTreatment(slug);
  if (!treatment) {
    return { title: "Treatment tidak ditemukan" };
  }
  return {
    title: treatment.name,
    description: treatment.description.slice(0, 160),
  };
}

async function TreatmentDetail({ params }: Pick<PageProps<"/treatment/[slug]">, "params">) {
  const { slug } = await params;
  const [treatment, therapists] = await Promise.all([getTreatment(slug), getTreatmentTherapists(slug)]);

  if (!treatment) {
    notFound();
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <TreatmentImage
          src={treatment.image_url}
          alt={treatment.name}
          sizes="(min-width: 1024px) 560px, 100vw"
          priority
          className="rounded-xl"
        />
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <p className="type-overline text-sage-700">Treatment</p>
            <h1 className="type-h1 text-neutral-900">{treatment.name}</h1>
          </div>
          <dl className="flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Harga</dt>
              <dd className="text-2xl font-semibold text-neutral-900">{formatRupiah(treatment.price)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Durasi</dt>
              <dd className="flex items-center gap-1.5 text-lg font-medium text-neutral-900">
                <Clock aria-hidden="true" strokeWidth={1.75} className="size-5 text-neutral-500" />
                {formatDuration(treatment.duration_minutes)}
              </dd>
            </div>
          </dl>
          {treatment.description && (
            <p className="max-w-prose leading-relaxed whitespace-pre-line text-neutral-700">
              {treatment.description}
            </p>
          )}
          <Button asChild size="lg" className="self-start">
            <Link href={`/booking?treatment=${treatment.slug}`}>Booking Treatment Ini</Link>
          </Button>
        </div>
      </div>

      <section aria-labelledby="terapis-heading" className="space-y-6">
        <h2 id="terapis-heading" className="type-h2 text-neutral-900">
          Terapis yang menangani
        </h2>
        <TherapistGrid
          therapists={therapists}
          emptyDescription="Belum ada terapis yang dijadwalkan untuk treatment ini."
        />
      </section>
    </>
  );
}

function TreatmentDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12" aria-busy="true" aria-label="Memuat treatment">
      <Skeleton className="aspect-[4/3] rounded-xl" />
      <div className="space-y-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-13 w-56" />
      </div>
    </div>
  );
}

export default function TreatmentDetailPage({ params }: PageProps<"/treatment/[slug]">) {
  return (
    <div className="container-page space-y-12 py-10 lg:space-y-20 lg:py-16">
      <Link
        href="/treatment"
        className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-neutral-700 hover:text-sage-700"
      >
        <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
        Semua treatment
      </Link>
      <Suspense fallback={<TreatmentDetailSkeleton />}>
        <TreatmentDetail params={params} />
      </Suspense>
    </div>
  );
}
