import { api } from "@/lib/api/client";

export type DashboardPendingBooking = {
  id: number;
  code: string;
  patient_name: string;
  treatment_name: string;
  therapist_name: string;
  start_at: string;
  needs_action: boolean;
};

export type DashboardTopTreatment = {
  name: string;
  count: number;
};

export type DashboardSummary = {
  today_count: number;
  pending_count: number;
  needs_action_count: number;
  pending_upcoming: DashboardPendingBooking[];
  revenue_month: number;
  top_treatments: DashboardTopTreatment[];
};

export const adminDashboardKey = ["admin-dashboard"] as const;

export function fetchAdminDashboard() {
  return api.get<DashboardSummary>("/admin/dashboard");
}
