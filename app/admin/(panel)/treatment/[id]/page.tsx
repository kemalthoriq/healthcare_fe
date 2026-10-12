import type { Metadata } from "next";
import { Suspense } from "react";
import { EditTreatment } from "@/components/admin/catalog/treatment-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { parseRouteId } from "@/lib/route-id";

export const metadata: Metadata = {
  title: "Ubah Treatment",
};

async function Editor({ params }: Pick<PageProps<"/admin/treatment/[id]">, "params">) {
  const { id } = await params;
  return <EditTreatment id={parseRouteId(id)} />;
}

export default function AdminEditTreatmentPage({ params }: PageProps<"/admin/treatment/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-3xl rounded-lg" />}>
      <Editor params={params} />
    </Suspense>
  );
}
