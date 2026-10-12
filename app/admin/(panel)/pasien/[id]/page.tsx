import type { Metadata } from "next";
import { Suspense } from "react";
import { PatientDetail } from "@/components/admin/patients/patient-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { parseRouteId } from "@/lib/route-id";

export const metadata: Metadata = {
  title: "Detail Pasien",
};

async function Detail({ params }: Pick<PageProps<"/admin/pasien/[id]">, "params">) {
  const { id } = await params;
  return <PatientDetail id={parseRouteId(id)} />;
}

export default function AdminPatientDetailPage({ params }: PageProps<"/admin/pasien/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <Detail params={params} />
    </Suspense>
  );
}
