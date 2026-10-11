import { api } from "@/lib/api/client";

export type Shift = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type TimeOff = {
  id: number;
  start_at: string;
  end_at: string;
  reason: string;
  created_at: string;
};

export type TimeOffInput = {
  start_at: string;
  end_at: string;
  reason: string;
};

export function schedulesKey(therapistId: number) {
  return ["admin-schedules", therapistId] as const;
}

export function timeOffKey(therapistId: number) {
  return ["admin-time-off", therapistId] as const;
}

export function fetchSchedules(therapistId: number) {
  return api.get<Shift[]>(`/admin/therapists/${therapistId}/schedules`);
}

export function saveSchedules(therapistId: number, shifts: Shift[]) {
  return api.put<Shift[]>(`/admin/therapists/${therapistId}/schedules`, { shifts });
}

export function fetchTimeOff(therapistId: number) {
  return api.get<TimeOff[]>(`/admin/therapists/${therapistId}/time-off`);
}

export function createTimeOff(therapistId: number, input: TimeOffInput) {
  return api.post<TimeOff>(`/admin/therapists/${therapistId}/time-off`, input);
}

export function deleteTimeOff(therapistId: number, timeOffId: number) {
  return api.delete(`/admin/therapists/${therapistId}/time-off/${timeOffId}`);
}
