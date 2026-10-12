import { api } from "@/lib/api/client";

export type BookingSettings = {
  buffer_minutes: number;
  min_booking_lead_minutes: number;
  max_booking_days_ahead: number;
  cancel_deadline_hours: number;
  updated_at: string;
};

export type BookingSettingsInput = Omit<BookingSettings, "updated_at">;

export type ClinicInfo = {
  clinic_name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  opening_hours_text: string;
  updated_at: string;
};

export type ClinicInfoInput = Omit<ClinicInfo, "updated_at">;

export const bookingSettingsKey = ["admin-settings"] as const;
export const clinicInfoKey = ["admin-clinic"] as const;

export function fetchBookingSettings() {
  return api.get<BookingSettings>("/admin/settings");
}

export function saveBookingSettings(input: BookingSettingsInput) {
  return api.put<BookingSettings>("/admin/settings", input);
}

export function fetchClinicInfo() {
  return api.get<ClinicInfo>("/admin/clinic");
}

export function saveClinicInfo(input: ClinicInfoInput) {
  return api.put<ClinicInfo>("/admin/clinic", input);
}
