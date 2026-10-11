import { api } from "@/lib/api/client";

export type AdminRole = "admin" | "therapist";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
};

export const meQueryKey = ["me"] as const;

export function login(email: string, password: string): Promise<AdminUser> {
  return api.post<AdminUser>("/admin/auth/login", { email, password });
}

export function logout(): Promise<void> {
  return api.post<void>("/admin/auth/logout");
}

export function fetchMe(): Promise<AdminUser> {
  return api.get<AdminUser>("/admin/auth/me");
}

export const LOGIN_PATH = "/admin/login";

export function safeNextPath(value: string | null): string {
  if (value && value.startsWith("/admin") && !value.startsWith("//") && !value.startsWith(LOGIN_PATH)) {
    return value;
  }
  return "/admin";
}

export function loginUrl(next: string): string {
  return next === "/admin" ? LOGIN_PATH : `${LOGIN_PATH}?next=${encodeURIComponent(next)}`;
}
