import type { Metadata } from "next";
import { Suspense } from "react";
import { EditPromo } from "@/components/admin/promos/promo-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { parseRouteId } from "@/lib/route-id";

export const metadata: Metadata = {
  title: "Ubah Promo",
};

async function Editor({ params }: Pick<PageProps<"/admin/promo/[id]">, "params">) {
  const { id } = await params;
  return <EditPromo id={parseRouteId(id)} />;
}

export default function AdminEditPromoPage({ params }: PageProps<"/admin/promo/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-3xl rounded-lg" />}>
      <Editor params={params} />
    </Suspense>
  );
}
