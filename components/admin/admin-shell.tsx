"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminUserProvider } from "@/components/admin/admin-user";
import { QueryError } from "@/components/query-error";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMe, LOGIN_PATH, logout, meQueryKey } from "@/lib/api/auth";
import { isApiError } from "@/lib/api/client";

function ShellSkeleton() {
  return (
    <div className="flex flex-1" aria-busy="true" aria-label="Memuat panel">
      <div className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar p-4 lg:block">
        <Skeleton className="h-10 w-32" />
        <div className="mt-8 space-y-2">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      </div>
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const meQuery = useQuery({ queryKey: meQueryKey, queryFn: fetchMe, staleTime: 5 * 60_000 });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: (_data, error) => {
      if (error && !(isApiError(error) && error.status === 401)) {
        toast.error("Gagal keluar. Silakan coba lagi.");
        return;
      }
      queryClient.clear();
      router.replace(LOGIN_PATH);
    },
  });

  if (meQuery.isPending || (meQuery.error && isApiError(meQuery.error) && meQuery.error.status === 401)) {
    return <ShellSkeleton />;
  }

  if (meQuery.error) {
    return (
      <div className="mx-auto w-full max-w-md p-6">
        <QueryError error={meQuery.error} onRetry={() => meQuery.refetch()} />
      </div>
    );
  }

  const user = meQuery.data;
  const sidebarProps = {
    user,
    onLogout: () => logoutMutation.mutate(),
    loggingOut: logoutMutation.isPending,
  };

  return (
    <AdminUserProvider value={user}>
      <div className="flex min-h-full flex-1">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
          <div className="flex h-16 items-center px-6">
            <Logo href="/admin" label="Panel Lumière, ke dashboard" />
          </div>
          <AdminSidebar {...sidebarProps} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
            <Logo href="/admin" label="Panel Lumière, ke dashboard" />
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Buka menu panel">
                  <Menu strokeWidth={1.75} className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-0">
                <SheetHeader className="border-b border-sidebar-border">
                  <SheetTitle className="text-base">Menu panel</SheetTitle>
                  <SheetDescription className="sr-only">Navigasi panel admin Lumière</SheetDescription>
                </SheetHeader>
                <AdminSidebar {...sidebarProps} onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </header>
          <main id="konten" className="flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminUserProvider>
  );
}
