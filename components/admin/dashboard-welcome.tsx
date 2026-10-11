"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useAdminUser } from "@/components/admin/admin-user";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";

export function DashboardWelcome() {
  const user = useAdminUser();

  return (
    <div className="space-y-6">
      <PageHeader title={`Halo, ${user.name}`} description="Selamat datang di panel Lumière Aesthetic Clinic." />
      <div className="rounded-lg bg-card p-6 shadow-sm">
        <p className="text-sm text-neutral-700">
          Gunakan menu di samping untuk mengelola klinik. Halaman publik bisa dibuka untuk melihat tampilan yang
          dilihat pasien.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/" target="_blank" rel="noopener">
            Buka situs publik
            <ExternalLink aria-hidden="true" strokeWidth={1.75} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
