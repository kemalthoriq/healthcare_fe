"use client";

import { createContext, useContext } from "react";
import type { AdminUser } from "@/lib/api/auth";

const AdminUserContext = createContext<AdminUser | null>(null);

export const AdminUserProvider = AdminUserContext.Provider;

export function useAdminUser(): AdminUser {
  const user = useContext(AdminUserContext);
  if (!user) {
    throw new Error("useAdminUser must be used inside AdminShell");
  }
  return user;
}
