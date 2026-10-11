import { formatDateLong, formatTime } from "@/lib/format";

type BookingForMessage = {
  patient_name: string;
  patient_phone: string;
  treatment_name: string;
  start_at: string;
  code: string;
};

export function bookingWhatsAppUrl(booking: BookingForMessage): string {
  const phone = booking.patient_phone.replace(/\D/g, "");
  const text = [
    `Halo ${booking.patient_name}, kami dari Lumière Aesthetic Clinic.`,
    `Terkait booking ${booking.treatment_name} pada ${formatDateLong(booking.start_at)} pukul ${formatTime(booking.start_at)} (kode ${booking.code}).`,
  ].join(" ");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
