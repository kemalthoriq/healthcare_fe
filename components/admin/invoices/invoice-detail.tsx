"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, SearchX } from "lucide-react";
import { DiscountForm } from "@/components/admin/invoices/discount-form";
import { InvoiceStatusBadge } from "@/components/admin/invoices/invoice-status-badge";
import { PayInvoiceDialog } from "@/components/admin/invoices/pay-invoice-dialog";
import { useInvoiceMutations } from "@/components/admin/invoices/use-invoice-mutations";
import { SectionCard } from "@/components/admin/section-card";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import { adminInvoiceKey, fetchAdminInvoice, paymentMethodLabel, type AdminInvoice } from "@/lib/api/admin-invoices";
import { isApiError } from "@/lib/api/client";
import { formatDateLong, formatDateShort, formatPhone, formatRupiah, formatTime } from "@/lib/format";

function Rows({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-sm text-muted-foreground">{row.label}</dt>
          <dd className="font-medium break-words text-neutral-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Amounts({ invoice }: { invoice: AdminInvoice }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="text-neutral-900 tabular-nums">{formatRupiah(invoice.subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Diskon</dt>
        <dd className="text-neutral-900 tabular-nums">
          {invoice.discount > 0 ? `− ${formatRupiah(invoice.discount)}` : formatRupiah(0)}
        </dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-border pt-3 text-base">
        <dt className="font-semibold text-neutral-900">Total</dt>
        <dd className="font-semibold text-neutral-900 tabular-nums">{formatRupiah(invoice.total)}</dd>
      </div>
    </dl>
  );
}

function Payment({ invoice }: { invoice: AdminInvoice }) {
  const { discount, pay } = useInvoiceMutations(invoice.id);

  if (invoice.status === "paid") {
    return (
      <div className="space-y-6">
        <Amounts invoice={invoice} />
        <div className="rounded-md bg-success-bg p-4 text-sm text-success">
          <p className="font-semibold">
            Lunas{invoice.payment_method ? ` · ${paymentMethodLabel[invoice.payment_method]}` : ""}
          </p>
          {invoice.paid_at && (
            <p className="mt-1">
              {formatDateShort(invoice.paid_at)}, {formatTime(invoice.paid_at)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Amounts invoice={invoice} />
      <DiscountForm
        key={invoice.discount}
        initial={invoice.discount}
        subtotal={invoice.subtotal}
        pending={discount.isPending}
        onSave={discount.mutateAsync}
      />
      <div className="border-t border-border pt-6">
        <PayInvoiceDialog
          total={invoice.total}
          pending={pay.isPending}
          disabled={discount.isPending}
          onPay={pay.mutateAsync}
        />
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat invoice">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  );
}

export function InvoiceDetail({ id }: { id: number }) {
  const query = useQuery({ queryKey: adminInvoiceKey(id), queryFn: () => fetchAdminInvoice(id) });

  const backLink = (
    <Link
      href="/admin/invoice"
      className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-neutral-700 hover:text-sage-700"
    >
      <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
      Daftar invoice
    </Link>
  );

  if (query.isPending) {
    return <DetailSkeleton />;
  }

  if (query.error) {
    return (
      <div className="space-y-6">
        {backLink}
        {isApiError(query.error) && query.error.status === 404 ? (
          <EmptyState icon={SearchX} title="Invoice tidak ditemukan" description="Invoice ini tidak ada." />
        ) : (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        )}
      </div>
    );
  }

  const invoice = query.data;

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-semibold tracking-wider text-neutral-900">{invoice.number}</h1>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-6">
          <SectionCard title="Booking">
            <Rows
              rows={[
                {
                  label: "Kode booking",
                  value: (
                    <Link
                      href={`/admin/booking/${invoice.booking_id}`}
                      className="rounded-sm font-mono tracking-wider text-sage-700 hover:underline"
                    >
                      {invoice.booking_code}
                    </Link>
                  ),
                },
                { label: "Tanggal", value: formatDateLong(invoice.booking_start_at) },
                { label: "Treatment", value: invoice.treatment_name },
                { label: "Terapis", value: invoice.therapist_name },
              ]}
            />
          </SectionCard>

          <SectionCard title="Pasien">
            <Rows
              rows={[
                { label: "Nama", value: invoice.patient_name },
                { label: "WhatsApp", value: formatPhone(invoice.patient_phone) },
              ]}
            />
          </SectionCard>

          <p className="text-sm text-muted-foreground">
            Dibuat {formatDateShort(invoice.created_at)}, {formatTime(invoice.created_at)}
          </p>
        </div>

        <div className="lg:sticky lg:top-6">
          <SectionCard title="Pembayaran">
            <Payment invoice={invoice} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
