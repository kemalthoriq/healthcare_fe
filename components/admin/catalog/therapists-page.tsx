"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, KeyRound, Plus, Users } from "lucide-react";
import { ActiveBadge } from "@/components/admin/active-badge";
import { SearchInput } from "@/components/admin/catalog/search-input";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminTherapistsKey, fetchAdminTherapists } from "@/lib/api/admin-catalog";
import { initials } from "@/lib/initials";

export function TherapistsPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: adminTherapistsKey, queryFn: fetchAdminTherapists });
  const keyword = search.trim().toLowerCase();
  const items = (query.data ?? []).filter((item) => item.name.toLowerCase().includes(keyword));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Terapis"
        description="Kelola profil terapis dan akun login mereka."
        actions={
          <Button asChild>
            <Link href="/admin/terapis/baru">
              <Plus aria-hidden="true" strokeWidth={1.75} />
              Tambah Terapis
            </Link>
          </Button>
        }
      />

      <SearchInput value={search} onChange={setSearch} label="Cari nama terapis" />

      {query.isPending ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : query.error ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title={keyword ? "Tidak ada yang cocok" : "Belum ada terapis"}
          description={keyword ? "Coba kata kunci lain." : "Tambahkan terapis lalu hubungkan ke treatment."}
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/admin/terapis/${item.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-100 font-display text-base text-sage-700"
                >
                  {initials(item.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900">{item.name}</p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {item.title || "—"}
                    {item.has_account && (
                      <span className="inline-flex items-center gap-1 text-sage-700">
                        · <KeyRound aria-hidden="true" strokeWidth={1.75} className="size-3.5" /> Punya akun
                      </span>
                    )}
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
