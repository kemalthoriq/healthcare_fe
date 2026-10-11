"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { CreateInvoiceDialog } from "@/components/admin/invoices/create-invoice-dialog";
import { InvoiceStatusBadge } from "@/components/admin/invoices/invoice-status-badge";
import { useCreateInvoice } from "@/components/admin/invoices/use-invoice-mutations";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminBooking } from "@/lib/api/admin-bookings";
import { adminInvoicesKey, fetchAdminInvoices } from "@/lib/api/admin-invoices";
import { formatRupiah } from "@/lib/format";

export function BookingInvoice({ booking }: { booking: AdminBooking }) {
  const router = useRouter();
  const filters = { booking_id: booking.id, per_page: 1 };
  const query = useQuery({
    queryKey: [...adminInvoicesKey, filters],
    queryFn: () => fetchAdminInvoices(filters),
  });
  const create = useCreateInvoice(booking.id);

  if (query.isPending) {
    return <Skeleton className="h-16 rounded-md" />;
  }

  if (query.error) {
    return <QueryError error={query.error} onRetry={() => query.refetch()} />;
  }

  const invoice = query.data.data[0];

  if (!invoice) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Booking ini belum memiliki invoice.</p>
        <CreateInvoiceDialog
          subtotal={booking.price}
          pending={create.isPending}
          onCreate={async (discount) => {
            const created = await create.mutateAsync(discount).catch(() => null);
            if (created) {
              router.push(`/admin/invoice/${created.id}`);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono font-semibold tracking-wide text-neutral-900">{invoice.number}</p>
        <InvoiceStatusBadge status={invoice.status} />
      </div>
      <p className="text-sm text-muted-foreground">Total {formatRupiah(invoice.total)}</p>
      <Link
        href={`/admin/invoice/${invoice.id}`}
        className="inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-sage-700 hover:underline"
      >
        Buka invoice
        <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
      </Link>
    </div>
  );
}
