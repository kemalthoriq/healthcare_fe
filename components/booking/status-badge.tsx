import type { BookingStatus } from "@/lib/api/types";
import { bookingStatusClass, bookingStatusLabel } from "@/lib/booking-status";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        bookingStatusClass[status],
        className,
      )}
    >
      {bookingStatusLabel[status]}
    </span>
  );
}
