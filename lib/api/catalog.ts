import { cacheLife } from "next/cache";
import { api, isApiError } from "@/lib/api/client";
import type { Promo, PublicClinic, Therapist, Treatment } from "@/lib/api/types";

async function listOrEmpty<T>(path: string): Promise<T[]> {
  try {
    return (await api.get<T[]>(path)) ?? [];
  } catch (err) {
    console.error(`GET ${path} failed`, err);
    return [];
  }
}

export async function getTreatments(): Promise<Treatment[]> {
  "use cache";
  cacheLife("minutes");
  return listOrEmpty<Treatment>("/treatments");
}

export async function getTreatment(slug: string): Promise<Treatment | null> {
  "use cache";
  cacheLife("minutes");
  try {
    return await api.get<Treatment>(`/treatments/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (isApiError(err, "NOT_FOUND")) {
      return null;
    }
    throw err;
  }
}

export async function getTherapists(): Promise<Therapist[]> {
  "use cache";
  cacheLife("minutes");
  return listOrEmpty<Therapist>("/therapists");
}

export async function getTreatmentTherapists(slug: string): Promise<Therapist[]> {
  "use cache";
  cacheLife("minutes");
  return listOrEmpty<Therapist>(`/treatments/${encodeURIComponent(slug)}/therapists`);
}

export async function getPromos(): Promise<Promo[]> {
  "use cache";
  cacheLife("minutes");
  return listOrEmpty<Promo>("/promos");
}

export async function getClinic(): Promise<PublicClinic | null> {
  "use cache";
  cacheLife("minutes");
  try {
    return await api.get<PublicClinic>("/clinic");
  } catch (err) {
    console.error("GET /clinic failed", err);
    return null;
  }
}
