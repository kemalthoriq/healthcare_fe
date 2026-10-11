import { api, isApiError } from "@/lib/api/client";
import type { CreatedBooking, PublicBooking, Slot, Therapist } from "@/lib/api/types";

export type CreateBookingInput = {
  treatment_slug: string;
  therapist_slug: string;
  start_at: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  consent: boolean;
};

function query(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

export function fetchTreatmentTherapists(treatment: string): Promise<Therapist[]> {
  return api.get<Therapist[]>(`/treatments/${encodeURIComponent(treatment)}/therapists`);
}

export function fetchAvailableDates(treatment: string, therapist: string, month: string): Promise<string[]> {
  return api.get<string[]>(`/availability/dates?${query({ treatment, therapist, month })}`);
}

export function fetchSlots(treatment: string, therapist: string, date: string): Promise<Slot[]> {
  return api.get<Slot[]>(`/availability/slots?${query({ treatment, therapist, date })}`);
}

export function createBooking(input: CreateBookingInput): Promise<CreatedBooking> {
  return api.post<CreatedBooking>("/bookings", input);
}

export function cancelBooking(code: string, reason: string): Promise<PublicBooking> {
  return api.post<PublicBooking>(`/bookings/${encodeURIComponent(code)}/cancel`, { reason });
}

export async function getBooking(code: string): Promise<PublicBooking | null> {
  try {
    return await api.get<PublicBooking>(`/bookings/${encodeURIComponent(code)}`, { cache: "no-store" });
  } catch (err) {
    if (isApiError(err, "NOT_FOUND")) {
      return null;
    }
    throw err;
  }
}
