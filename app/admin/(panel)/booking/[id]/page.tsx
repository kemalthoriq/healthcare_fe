import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingDetail } from "@/components/admin/bookings/booking-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { parseRouteId } from "@/lib/route-id";

export const metadata: Metadata = {
  title: "Detail Booking",
};

async function Detail({ params }: Pick<PageProps<"/admin/booking/[id]">, "params">) {
  const { id } = await params;
  return <BookingDetail id={parseRouteId(id)} />;
}

export default function AdminBookingDetailPage({ params }: PageProps<"/admin/booking/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <Detail params={params} />
    </Suspense>
  );
}
