import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookingStatusSkeleton, BookingStatusView } from "@/components/booking/booking-status-view";
import { Button } from "@/components/ui/button";
import { getClinic } from "@/lib/api/catalog";

export const metadata: Metadata = {
  title: "Status Booking",
  robots: { index: false, follow: false },
};

type Props = PageProps<"/booking/[kode]">;

async function BookingStatus({ params }: Pick<Props, "params">) {
  const [{ kode }, clinic] = await Promise.all([params, getClinic()]);
  return <BookingStatusView code={decodeURIComponent(kode)} clinicWhatsapp={clinic?.whatsapp ?? ""} />;
}

export default function BookingStatusPage({ params }: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10 md:px-6 lg:py-16">
      <div className="space-y-3">
        <p className="type-overline text-sage-700">Status Booking</p>
        <h1 className="type-h1 text-neutral-900">Detail booking Anda</h1>
      </div>
      <Suspense fallback={<BookingStatusSkeleton />}>
        <BookingStatus params={params} />
      </Suspense>
      <Button asChild variant="outline">
        <Link href="/booking">Buat booking baru</Link>
      </Button>
    </div>
  );
}
