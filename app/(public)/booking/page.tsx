import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/booking-flow";
import { CheckBookingForm } from "@/components/booking/check-booking-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getTreatments } from "@/lib/api/catalog";

export const metadata: Metadata = {
  title: "Booking",
  description: "Booking treatment di Lumière Aesthetic Clinic: pilih treatment, terapis, tanggal, dan jam.",
};

function BookingFlowSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Memuat form booking">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </div>
  );
}

export default async function BookingPage() {
  const treatments = await getTreatments();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 px-4 py-10 md:px-6 lg:py-16">
      <div className="space-y-3">
        <p className="type-overline text-sage-700">Booking Online</p>
        <h1 className="type-h1 text-neutral-900">Atur jadwal perawatan Anda</h1>
      </div>
      <Suspense fallback={<BookingFlowSkeleton />}>
        <BookingFlow treatments={treatments} />
      </Suspense>
      <div className="max-w-xl rounded-lg border border-border bg-card p-6">
        <CheckBookingForm />
      </div>
    </div>
  );
}
