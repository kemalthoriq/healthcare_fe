import type { Metadata } from "next";
import { Suspense } from "react";
import { InvoiceDetail } from "@/components/admin/invoices/invoice-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { parseRouteId } from "@/lib/route-id";

export const metadata: Metadata = {
  title: "Detail Invoice",
};

async function Detail({ params }: Pick<PageProps<"/admin/invoice/[id]">, "params">) {
  const { id } = await params;
  return <InvoiceDetail id={parseRouteId(id)} />;
}

export default function AdminInvoiceDetailPage({ params }: PageProps<"/admin/invoice/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <Detail params={params} />
    </Suspense>
  );
}
