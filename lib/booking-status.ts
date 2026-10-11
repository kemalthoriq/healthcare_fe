import type { BookingStatus } from "@/lib/api/types";

export const bookingStatusLabel: Record<BookingStatus, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Terkonfirmasi",
  completed: "Selesai",
  no_show: "Tidak Datang",
  cancelled: "Dibatalkan",
};

export const bookingStatusClass: Record<BookingStatus, string> = {
  pending: "bg-warning-bg text-warning",
  confirmed: "bg-sage-100 text-sage-700",
  completed: "bg-success-bg text-success",
  no_show: "bg-neutral-100 text-neutral-700",
  cancelled: "bg-danger-bg text-danger",
};
