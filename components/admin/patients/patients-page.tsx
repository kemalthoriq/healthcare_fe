"use client";

import { useEffect, useId, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search, UserSearch } from "lucide-react";
import { Pagination } from "@/components/admin/bookings/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { PatientList } from "@/components/admin/patients/patient-list";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminPatientsKey,
  fetchAdminPatients,
  PATIENT_QUERY_MAX_LENGTH,
  type AdminPatientFilters,
} from "@/lib/api/admin-patients";
import { cn } from "@/lib/utils";

const PER_PAGE = 20;
const SEARCH_DELAY_MS = 300;

export function PatientsPage() {
  const searchId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = (searchParams.get("q") ?? "").trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [input, setInput] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    setSyncedQ(q);
    if (input.trim() !== q) {
      setInput(q);
    }
  }

  useEffect(() => {
    const value = input.trim();
    if (value === q) {
      return;
    }
    const timer = setTimeout(() => {
      const target = value ? `${pathname}?${new URLSearchParams({ q: value })}` : pathname;
      router.replace(target, { scroll: false });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [input, q, pathname, router]);

  const filters: AdminPatientFilters = { q, page, per_page: PER_PAGE };

  const patientsQuery = useQuery({
    queryKey: [...adminPatientsKey, filters],
    queryFn: () => fetchAdminPatients(filters),
    placeholderData: keepPreviousData,
  });

  function changePage(value: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(value));
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pasien" description="Pasien tercatat otomatis dari booking, diurutkan berdasarkan nama." />

      <div className="space-y-2 rounded-lg border border-border bg-card p-4">
        <Label htmlFor={searchId}>Cari pasien</Label>
        <div className="relative max-w-md">
          <Search
            aria-hidden="true"
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            id={searchId}
            type="search"
            value={input}
            maxLength={PATIENT_QUERY_MAX_LENGTH}
            placeholder="Nama atau nomor WhatsApp"
            autoComplete="off"
            onChange={(event) => setInput(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {patientsQuery.isPending ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat pasien">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : patientsQuery.error ? (
        <QueryError error={patientsQuery.error} onRetry={() => patientsQuery.refetch()} />
      ) : patientsQuery.data.data.length === 0 ? (
        <EmptyState
          icon={UserSearch}
          title={q ? "Pasien tidak ditemukan" : "Belum ada pasien"}
          description={
            q
              ? `Tidak ada pasien dengan nama atau nomor yang cocok dengan "${q}".`
              : "Pasien akan muncul di sini setelah booking pertama masuk."
          }
        />
      ) : (
        <div className={cn("space-y-4 transition-opacity", patientsQuery.isPlaceholderData && "opacity-60")}>
          <PatientList patients={patientsQuery.data.data} />
          <Pagination meta={patientsQuery.data.meta} onPageChange={changePage} />
        </div>
      )}
    </div>
  );
}
