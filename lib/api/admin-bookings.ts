import { api } from "@/lib/api/client";
import type { BookingStatus, Therapist, Treatment } from "@/lib/api/types";

export type AdminBooking = {
  id: number;
  code: string;
  status: BookingStatus;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  treatment_id: number;
  treatment_name: string;
  therapist_id: number;
  therapist_name: string;
  start_at: string;
  end_at: string;
  price: number;
  note?: string;
  treatment_note?: string;
  cancel_reason?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  completed_at?: string;
  needs_action: boolean;
  created_at: string;
};

export type AdminBookingFilters = {
  status?: BookingStatus;
  therapist_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};

export type BookingAction = "confirm" | "complete" | "no-show";

export const adminBookingsKey = ["admin-bookings"] as const;

export function adminBookingKey(id: number) {
  return ["admin-booking", id] as const;
}

function toQuery(filters: AdminBookingFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function fetchAdminBookings(filters: AdminBookingFilters) {
  return api.list<AdminBooking>(`/admin/bookings${toQuery(filters)}`);
}

export function fetchAdminBooking(id: number) {
  return api.get<AdminBooking>(`/admin/bookings/${id}`);
}

export function runBookingAction(id: number, action: BookingAction) {
  return api.post<AdminBooking>(`/admin/bookings/${id}/${action}`);
}

export function cancelAdminBooking(id: number, reason: string) {
  return api.post<AdminBooking>(`/admin/bookings/${id}/cancel`, { reason });
}

export function rescheduleAdminBooking(id: number, startAt: string) {
  return api.post<AdminBooking>(`/admin/bookings/${id}/reschedule`, { start_at: startAt });
}

export function saveTreatmentNote(id: number, content: string) {
  return api.put<AdminBooking>(`/admin/bookings/${id}/note`, { content });
}

export function fetchAdminTherapists() {
  return api.get<Therapist[]>("/admin/therapists");
}

export function fetchAdminTherapist(id: number) {
  return api.get<Therapist>(`/admin/therapists/${id}`);
}

export function fetchAdminTreatment(id: number) {
  return api.get<Treatment>(`/admin/treatments/${id}`);
}
