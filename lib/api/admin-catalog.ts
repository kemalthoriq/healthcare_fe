import { api } from "@/lib/api/client";
import type { Therapist, Treatment } from "@/lib/api/types";

export type TreatmentInput = {
  name: string;
  description: string;
  image_url: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
};

export type TherapistInput = {
  name: string;
  title: string;
  bio: string;
  photo_url: string;
  is_active: boolean;
};

export const adminTreatmentsKey = ["admin-treatments"] as const;
export const adminTherapistsKey = ["admin-therapists"] as const;

export function adminTreatmentKey(id: number) {
  return ["admin-treatment", id] as const;
}

export function adminTherapistKey(id: number) {
  return ["admin-therapist", id] as const;
}

export function treatmentTherapistsKey(id: number) {
  return ["admin-treatment-therapists", id] as const;
}

export function fetchAdminTreatments() {
  return api.get<Treatment[]>("/admin/treatments");
}

export function fetchAdminTreatment(id: number) {
  return api.get<Treatment>(`/admin/treatments/${id}`);
}

export function createTreatment(input: TreatmentInput) {
  return api.post<Treatment>("/admin/treatments", input);
}

export function updateTreatment(id: number, input: TreatmentInput) {
  return api.put<Treatment>(`/admin/treatments/${id}`, input);
}

export function deleteTreatment(id: number) {
  return api.delete(`/admin/treatments/${id}`);
}

export function fetchTreatmentTherapists(id: number) {
  return api.get<Therapist[]>(`/admin/treatments/${id}/therapists`);
}

export function setTreatmentTherapists(id: number, therapistIds: number[]) {
  return api.put<Therapist[]>(`/admin/treatments/${id}/therapists`, { therapist_ids: therapistIds });
}

export function fetchAdminTherapists() {
  return api.get<Therapist[]>("/admin/therapists");
}

export function fetchAdminTherapist(id: number) {
  return api.get<Therapist>(`/admin/therapists/${id}`);
}

export function createTherapist(input: TherapistInput) {
  return api.post<Therapist>("/admin/therapists", input);
}

export function updateTherapist(id: number, input: TherapistInput) {
  return api.put<Therapist>(`/admin/therapists/${id}`, input);
}

export function deleteTherapist(id: number) {
  return api.delete(`/admin/therapists/${id}`);
}

export function createTherapistAccount(id: number, email: string, password: string) {
  return api.post<Therapist>(`/admin/therapists/${id}/account`, { email, password });
}
