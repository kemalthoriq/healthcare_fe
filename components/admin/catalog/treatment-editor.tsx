"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, SearchX } from "lucide-react";
import { toast } from "sonner";
import { ActiveBadge } from "@/components/admin/active-badge";
import { DeleteSection } from "@/components/admin/catalog/delete-section";
import { TreatmentForm } from "@/components/admin/catalog/treatment-form";
import { TreatmentTherapistsEditor } from "@/components/admin/catalog/treatment-therapists-editor";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminTreatmentKey,
  adminTreatmentsKey,
  createTreatment,
  deleteTreatment,
  fetchAdminTreatment,
  updateTreatment,
  type TreatmentInput,
} from "@/lib/api/admin-catalog";
import { isApiError } from "@/lib/api/client";

const backLink = (
  <Link
    href="/admin/treatment"
    className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-neutral-700 hover:text-sage-700"
  >
    <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
    Daftar treatment
  </Link>
);

export function NewTreatment() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleCreate(values: TreatmentInput) {
    const treatment = await createTreatment(values);
    queryClient.setQueryData(adminTreatmentKey(treatment.id), treatment);
    queryClient.invalidateQueries({ queryKey: adminTreatmentsKey });
    toast.success("Treatment ditambahkan. Pilih terapis yang menanganinya.");
    router.replace(`/admin/treatment/${treatment.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {backLink}
      <PageHeader title="Tambah treatment" />
      <SectionCard title="Data treatment">
        <TreatmentForm submitLabel="Simpan Treatment" resetAfterSubmit onSubmit={handleCreate} />
      </SectionCard>
    </div>
  );
}

export function EditTreatment({ id }: { id: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: adminTreatmentKey(id), queryFn: () => fetchAdminTreatment(id) });

  if (query.isPending) {
    return <Skeleton className="mx-auto h-96 max-w-3xl rounded-lg" />;
  }
  if (query.error) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {backLink}
        {isApiError(query.error, "NOT_FOUND") ? (
          <EmptyState icon={SearchX} title="Treatment tidak ditemukan" description="Treatment ini mungkin sudah dihapus." />
        ) : (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        )}
      </div>
    );
  }

  const treatment = query.data;
  const initial: TreatmentInput = {
    name: treatment.name,
    description: treatment.description,
    image_url: treatment.image_url,
    price: treatment.price,
    duration_minutes: treatment.duration_minutes,
    is_active: treatment.is_active,
  };

  async function handleUpdate(values: TreatmentInput) {
    const updated = await updateTreatment(id, values);
    queryClient.setQueryData(adminTreatmentKey(id), updated);
    queryClient.invalidateQueries({ queryKey: adminTreatmentsKey });
    toast.success("Treatment disimpan.");
  }

  async function handleDelete() {
    await deleteTreatment(id);
    queryClient.removeQueries({ queryKey: adminTreatmentKey(id) });
    queryClient.invalidateQueries({ queryKey: adminTreatmentsKey });
    toast.success("Treatment dihapus.");
    router.replace("/admin/treatment");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {backLink}
      <PageHeader
        title={treatment.name}
        description={`Slug: /treatment/${treatment.slug}`}
        actions={<ActiveBadge active={treatment.is_active} />}
      />
      <SectionCard title="Data treatment">
        <TreatmentForm key={treatment.updated_at} initial={initial} submitLabel="Simpan Perubahan" onSubmit={handleUpdate} />
      </SectionCard>
      <SectionCard
        title="Terapis yang menangani"
        description="Hanya terapis yang dicentang yang bisa dipilih pasien untuk treatment ini."
      >
        <TreatmentTherapistsEditor treatmentId={id} />
      </SectionCard>
      <DeleteSection entity="Treatment" name={treatment.name} onDelete={handleDelete} />
    </div>
  );
}
