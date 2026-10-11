"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus, Sparkles } from "lucide-react";
import { ActiveBadge } from "@/components/admin/active-badge";
import { SearchInput } from "@/components/admin/catalog/search-input";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminTreatmentsKey, fetchAdminTreatments } from "@/lib/api/admin-catalog";
import { formatDuration, formatRupiah } from "@/lib/format";

export function TreatmentsPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: adminTreatmentsKey, queryFn: fetchAdminTreatments });
  const keyword = search.trim().toLowerCase();
  const items = (query.data ?? []).filter((item) => item.name.toLowerCase().includes(keyword));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treatment"
        description="Kelola daftar treatment, harga, dan durasi."
        actions={
          <Button asChild>
            <Link href="/admin/treatment/baru">
              <Plus aria-hidden="true" strokeWidth={1.75} />
              Tambah Treatment
            </Link>
          </Button>
        }
      />

      <SearchInput value={search} onChange={setSearch} label="Cari nama treatment" />

      {query.isPending ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : query.error ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={keyword ? "Tidak ada yang cocok" : "Belum ada treatment"}
          description={keyword ? "Coba kata kunci lain." : "Tambahkan treatment pertama agar pasien bisa booking."}
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/treatment/${item.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatRupiah(item.price)} · {formatDuration(item.duration_minutes)}
                  </p>
                </div>
                <ActiveBadge active={item.is_active} />
                <ChevronRight aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0 text-neutral-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
