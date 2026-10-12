import { formatDateLong, formatTime } from "@/lib/format";

type BookingForMessage = {
  patient_name: string;
  patient_phone: string;
  treatment_name: string;
  start_at: string;
  code: string;
};

export function whatsAppUrl(phone: string, text?: string): string {
  const digits = phone.replace(/\D/g, "");
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}

export function bookingWhatsAppUrl(booking: BookingForMessage, clinicName: string): string {
  return whatsAppUrl(
    booking.patient_phone,
    [
      `Halo ${booking.patient_name}, kami dari ${clinicName}.`,
      `Terkait booking ${booking.treatment_name} pada ${formatDateLong(booking.start_at)} pukul ${formatTime(booking.start_at)} (kode ${booking.code}).`,
    ].join(" "),
  );
}
