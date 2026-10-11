import type { Metadata } from "next";
import { Suspense } from "react";
import { PatientsPage } from "@/components/admin/patients/patients-page";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Pasien",
};

export default function AdminPatientsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <PatientsPage />
    </Suspense>
  );
}
