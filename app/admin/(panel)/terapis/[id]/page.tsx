import type { Metadata } from "next";
import { Suspense } from "react";
import { EditTherapist } from "@/components/admin/catalog/therapist-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { parseRouteId } from "@/lib/route-id";

export const metadata: Metadata = {
  title: "Ubah Terapis",
};

async function Editor({ params }: Pick<PageProps<"/admin/terapis/[id]">, "params">) {
  const { id } = await params;
  return <EditTherapist id={parseRouteId(id)} />;
}

export default function AdminEditTherapistPage({ params }: PageProps<"/admin/terapis/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-3xl rounded-lg" />}>
      <Editor params={params} />
    </Suspense>
  );
}
