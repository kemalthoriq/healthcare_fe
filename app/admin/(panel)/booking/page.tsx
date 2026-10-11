import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingsPage } from "@/components/admin/bookings/bookings-page";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Booking",
};

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <BookingsPage />
    </Suspense>
  );
}
