import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingDetail } from "@/components/admin/bookings/booking-detail";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Detail Booking",
};

async function Detail({ params }: Pick<PageProps<"/admin/booking/[id]">, "params">) {
  const { id } = await params;
  const bookingId = Number(id);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    notFound();
  }
  return <BookingDetail id={bookingId} />;
}

export default function AdminBookingDetailPage({ params }: PageProps<"/admin/booking/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <Detail params={params} />
    </Suspense>
  );
}
