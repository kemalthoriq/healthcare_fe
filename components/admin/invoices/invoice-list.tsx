import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { InvoiceStatusBadge } from "@/components/admin/invoices/invoice-status-badge";
import type { AdminInvoice } from "@/lib/api/admin-invoices";
import { formatDateShort, formatRupiah } from "@/lib/format";

export function InvoiceList({ invoices }: { invoices: AdminInvoice[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 text-xs font-semibold text-neutral-700">
            <tr>
              <th scope="col" className="px-4 py-3">
                Invoice
              </th>
              <th scope="col" className="px-4 py-3">
                Pasien
              </th>
              <th scope="col" className="px-4 py-3">
                Treatment
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Total
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 align-top">
                  <p className="font-mono font-medium tracking-wide text-neutral-900">{invoice.number}</p>
                  <p className="text-muted-foreground">{formatDateShort(invoice.created_at)}</p>
                </td>
                <td className="px-4 py-3 align-top font-medium text-neutral-900">{invoice.patient_name}</td>
                <td className="px-4 py-3 align-top">
                  <p className="text-neutral-900">{invoice.treatment_name}</p>
                  <p className="text-muted-foreground">{formatDateShort(invoice.booking_start_at)}</p>
                </td>
                <td className="px-4 py-3 text-right align-top font-medium text-neutral-900 tabular-nums">
                  {formatRupiah(invoice.total)}
                </td>
                <td className="px-4 py-3 align-top">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-4 py-3 text-right align-top">
                  <Link
                    href={`/admin/invoice/${invoice.id}`}
                    className="inline-flex items-center gap-1 rounded-sm font-semibold text-sage-700 hover:underline"
                  >
                    Detail
                    <span className="sr-only"> invoice {invoice.number}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {invoices.map((invoice) => (
          <li key={invoice.id}>
            <Link
              href={`/admin/invoice/${invoice.id}`}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-xs"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-neutral-900">{invoice.patient_name}</p>
                  <p className="shrink-0 font-medium text-neutral-900 tabular-nums">{formatRupiah(invoice.total)}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono">{invoice.number}</span> · {invoice.treatment_name}
                </p>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <ChevronRight aria-hidden="true" strokeWidth={1.75} className="mt-1 size-5 shrink-0 text-neutral-400" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
