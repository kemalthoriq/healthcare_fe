import type { Metadata } from "next";
import { Suspense } from "react";
import { InvoicesPage } from "@/components/admin/invoices/invoices-page";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Invoice",
};

export default function AdminInvoicesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <InvoicesPage />
    </Suspense>
  );
}
