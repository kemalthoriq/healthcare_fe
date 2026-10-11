"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus, Tag } from "lucide-react";
import { Pagination } from "@/components/admin/bookings/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { PromoStateBadge } from "@/components/admin/promos/promo-state-badge";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPromosKey, fetchAdminPromos, promoState } from "@/lib/api/admin-promos";
import { toDateKey } from "@/lib/dates";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PromosPage() {
  const [page, setPage] = useState(1);
  const [today] = useState(() => toDateKey(new Date()));
  const query = useQuery({
    queryKey: [...adminPromosKey, page],
    queryFn: () => fetchAdminPromos(page),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promo"
        description="Promo aktif tampil di beranda dan halaman Promo selama periodenya."
        actions={
          <Button asChild>
            <Link href="/admin/promo/baru">
              <Plus aria-hidden="true" strokeWidth={1.75} />
              Tambah Promo
            </Link>
          </Button>
        }
      />

      {query.isPending ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : query.isError ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState icon={Tag} title="Belum ada promo" description="Buat promo untuk menarik pasien baru." />
      ) : (
        <div className={cn("space-y-4 transition-opacity", query.isPlaceholderData && "opacity-60")}>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {query.data.data.map((promo) => (
              <li key={promo.id}>
                <Link href={`/admin/promo/${promo.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900">{promo.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateRange(promo.start_date, promo.end_date)} · {promo.treatments.length} treatment
                    </p>
                  </div>
                  <PromoStateBadge state={promoState(promo, today)} />
                  <ChevronRight aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0 text-neutral-400" />
                </Link>
              </li>
            ))}
          </ul>
          <Pagination meta={query.data.meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
