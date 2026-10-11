"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isActivePath, navItemsFor } from "@/components/admin/nav-items";
import type { AdminUser } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const roleLabel = { admin: "Admin", therapist: "Terapis" } as const;

type AdminSidebarProps = {
  user: AdminUser;
  onNavigate?: () => void;
  onLogout: () => void;
  loggingOut: boolean;
};

export function AdminSidebar({ user, onNavigate, onLogout, loggingOut }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Navigasi panel" className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItemsFor(user.role).map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-[15px] font-medium transition-colors duration-150",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
                  )}
                >
                  <item.icon aria-hidden="true" strokeWidth={1.75} className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <p className="truncate text-sm font-semibold text-neutral-900">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {roleLabel[user.role]} · {user.email}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onLogout}
          disabled={loggingOut}
          className="mt-3 -ml-2 text-neutral-700"
        >
          <LogOut aria-hidden="true" strokeWidth={1.75} />
          Keluar
        </Button>
      </div>
    </div>
  );
}
