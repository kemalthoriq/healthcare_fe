import { CalendarCheck, LayoutDashboard, type LucideIcon } from "lucide-react";
import type { AdminRole } from "@/lib/api/auth";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: AdminRole[];
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "therapist"] },
  { href: "/admin/booking", label: "Booking", icon: CalendarCheck, roles: ["admin"] },
  { href: "/admin/booking", label: "Booking Saya", icon: CalendarCheck, roles: ["therapist"] },
];

export function navItemsFor(role: AdminRole): AdminNavItem[] {
  return adminNavItems.filter((item) => item.roles.includes(role));
}

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
