import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/layout/logo";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-sage-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="space-y-6 rounded-lg bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Masuk ke panel</h1>
            <p className="text-sm text-muted-foreground">Khusus admin dan terapis klinik.</p>
          </div>
          <Suspense
            fallback={
              <div className="space-y-5" aria-busy="true">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-11" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
