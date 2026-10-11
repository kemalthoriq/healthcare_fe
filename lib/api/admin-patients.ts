import { api } from "@/lib/api/client";
import type { BookingStatus } from "@/lib/api/types";

export type AdminPatient = {
  id: number;
  name: string;
  phone: string;
  email: string;
  booking_count: number;
  last_visit_at: string | null;
  created_at: string;
};

export type PatientBooking = {
  id: number;
  code: string;
  status: BookingStatus;
  treatment_name: string;
  therapist_name: string;
  start_at: string;
  end_at: string;
  price: number;
  treatment_note: string;
};

export type AdminPatientDetail = AdminPatient & {
  bookings: PatientBooking[];
};

export type AdminPatientFilters = {
  q?: string;
  page?: number;
  per_page?: number;
};

export const PATIENT_QUERY_MAX_LENGTH = 100;

export const adminPatientsKey = ["admin-patients"] as const;

export function adminPatientKey(id: number) {
  return ["admin-patient", id] as const;
}

export function fetchAdminPatients(filters: AdminPatientFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return api.list<AdminPatient>(`/admin/patients${query ? `?${query}` : ""}`);
}

export function fetchAdminPatient(id: number) {
  return api.get<AdminPatientDetail>(`/admin/patients/${id}`);
}
