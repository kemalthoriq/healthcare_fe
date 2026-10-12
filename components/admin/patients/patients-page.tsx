"use client";

import { useId } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { UserSearch } from "lucide-react";
import { Pagination } from "@/components/admin/bookings/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { PatientList } from "@/components/admin/patients/patient-list";
import { SearchField } from "@/components/admin/search-field";
import { useUrlSearch } from "@/components/admin/use-url-search";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminPatientsKey,
  fetchAdminPatients,
  PATIENT_QUERY_MAX_LENGTH,
  type AdminPatientFilters,
} from "@/lib/api/admin-patients";
import { cn } from "@/lib/utils";

const PER_PAGE = 20;

export function PatientsPage() {
  const searchId = useId();
  const { q, input, setInput, searchParams, updateParams } = useUrlSearch();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const filters: AdminPatientFilters = { q, page, per_page: PER_PAGE };

  const patientsQuery = useQuery({
    queryKey: [...adminPatientsKey, filters],
    queryFn: () => fetchAdminPatients(filters),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Pasien" description="Pasien tercatat otomatis dari booking, diurutkan berdasarkan nama." />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="max-w-md">
          <SearchField
            id={searchId}
            label="Cari pasien"
            placeholder="Nama atau nomor WhatsApp"
            value={input}
            maxLength={PATIENT_QUERY_MAX_LENGTH}
            onChange={setInput}
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
          <Pagination meta={patientsQuery.data.meta} onPageChange={(value) => updateParams({ page: String(value) })} />
        </div>
      )}
    </div>
  );
}
