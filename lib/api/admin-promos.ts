import { api } from "@/lib/api/client";
import type { Promo } from "@/lib/api/types";

export type PromoInput = {
  title: string;
  description: string;
  image_url: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  treatment_ids: number[];
};

export const adminPromosKey = ["admin-promos"] as const;

export function adminPromoKey(id: number) {
  return ["admin-promo", id] as const;
}

export function fetchAdminPromos(page: number) {
  return api.list<Promo>(`/admin/promos?page=${page}&per_page=20`);
}

export function fetchAdminPromo(id: number) {
  return api.get<Promo>(`/admin/promos/${id}`);
}

export function createPromo(input: PromoInput) {
  return api.post<Promo>("/admin/promos", input);
}

export function updatePromo(id: number, input: PromoInput) {
  return api.put<Promo>(`/admin/promos/${id}`, input);
}

export function deletePromo(id: number) {
  return api.delete(`/admin/promos/${id}`);
}

export type PromoState = "live" | "scheduled" | "ended" | "inactive";

export function promoState(promo: Pick<Promo, "is_active" | "start_date" | "end_date">, today: string): PromoState {
  if (!promo.is_active) {
    return "inactive";
  }
  if (today < promo.start_date) {
    return "scheduled";
  }
  return today > promo.end_date ? "ended" : "live";
}
