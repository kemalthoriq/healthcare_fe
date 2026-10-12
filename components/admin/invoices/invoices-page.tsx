"use client";

import { useId } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ReceiptText } from "lucide-react";
import { Pagination } from "@/components/admin/bookings/pagination";
import { InvoiceList } from "@/components/admin/invoices/invoice-list";
import { PageHeader } from "@/components/admin/page-header";
import { SearchField } from "@/components/admin/search-field";
import { useUrlSearch } from "@/components/admin/use-url-search";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminInvoicesKey,
  fetchAdminInvoices,
  INVOICE_QUERY_MAX_LENGTH,
  invoiceStatusLabel,
  type AdminInvoiceFilters,
  type InvoiceStatus,
} from "@/lib/api/admin-invoices";
import { cn } from "@/lib/utils";

const PER_PAGE = 20;

const STATUSES = Object.keys(invoiceStatusLabel) as InvoiceStatus[];

function isStatus(value: string | null): value is InvoiceStatus {
  return STATUSES.includes(value as InvoiceStatus);
}

export function InvoicesPage() {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const { q, input, setInput, searchParams, updateParams } = useUrlSearch();
  const rawStatus = searchParams.get("status");
  const status = isStatus(rawStatus) ? rawStatus : undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const filters: AdminInvoiceFilters = { status, q, page, per_page: PER_PAGE };

  const invoicesQuery = useQuery({
    queryKey: [...adminInvoicesKey, filters],
    queryFn: () => fetchAdminInvoices(filters),
    placeholderData: keepPreviousData,
  });

  const filtered = !!q || !!status;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoice"
        description="Invoice dibuat dari detail booking yang sudah selesai. Terbaru lebih dulu."
      />

      <div className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,28rem)_220px]">
        <SearchField
          id={f("search")}
          label="Cari invoice"
          placeholder="Nomor invoice atau nama pasien"
          value={input}
          maxLength={INVOICE_QUERY_MAX_LENGTH}
          onChange={setInput}
        />
        <div className="space-y-2">
          <Label htmlFor={f("status")}>Status</Label>
          <NativeSelect
            id={f("status")}
            value={status ?? ""}
            onChange={(event) => updateParams({ status: event.target.value || null })}
          >
            <option value="">Semua status</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {invoiceStatusLabel[value]}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {invoicesQuery.isPending ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat invoice">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : invoicesQuery.error ? (
        <QueryError error={invoicesQuery.error} onRetry={() => invoicesQuery.refetch()} />
      ) : invoicesQuery.data.data.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={filtered ? "Invoice tidak ditemukan" : "Belum ada invoice"}
          description={
            filtered
              ? "Tidak ada invoice yang cocok dengan pencarian atau filter ini."
              : "Buat invoice dari halaman detail booking yang sudah selesai."
          }
        />
      ) : (
        <div className={cn("space-y-4 transition-opacity", invoicesQuery.isPlaceholderData && "opacity-60")}>
          <InvoiceList invoices={invoicesQuery.data.data} />
          <Pagination meta={invoicesQuery.data.meta} onPageChange={(value) => updateParams({ page: String(value) })} />
        </div>
      )}
    </div>
  );
}
