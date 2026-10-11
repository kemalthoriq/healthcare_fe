"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, SearchX } from "lucide-react";
import { toast } from "sonner";
import { DeleteSection } from "@/components/admin/catalog/delete-section";
import { PageHeader } from "@/components/admin/page-header";
import { PromoForm } from "@/components/admin/promos/promo-form";
import { PromoStateBadge } from "@/components/admin/promos/promo-state-badge";
import { SectionCard } from "@/components/admin/section-card";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminPromoKey,
  adminPromosKey,
  createPromo,
  deletePromo,
  fetchAdminPromo,
  promoState,
  updatePromo,
  type PromoInput,
} from "@/lib/api/admin-promos";
import { isApiError } from "@/lib/api/client";
import { addDays, toDateKey } from "@/lib/dates";

const backLink = (
  <Link
    href="/admin/promo"
    className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-neutral-700 hover:text-sage-700"
  >
    <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
    Daftar promo
  </Link>
);

export function NewPromo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [initial] = useState<PromoInput>(() => {
    const today = toDateKey(new Date());
    return {
      title: "",
      description: "",
      image_url: "",
      start_date: today,
      end_date: addDays(today, 30),
      is_active: true,
      treatment_ids: [],
    };
  });

  async function handleCreate(values: PromoInput) {
    const promo = await createPromo(values);
    queryClient.setQueryData(adminPromoKey(promo.id), promo);
    queryClient.invalidateQueries({ queryKey: adminPromosKey });
    toast.success("Promo ditambahkan.");
    router.replace(`/admin/promo/${promo.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {backLink}
      <PageHeader title="Tambah promo" />
      <SectionCard title="Data promo">
        <PromoForm initial={initial} submitLabel="Simpan Promo" resetAfterSubmit onSubmit={handleCreate} />
      </SectionCard>
    </div>
  );
}

export function EditPromo({ id }: { id: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [today] = useState(() => toDateKey(new Date()));
  const query = useQuery({ queryKey: adminPromoKey(id), queryFn: () => fetchAdminPromo(id) });

  if (query.isPending) {
    return <Skeleton className="mx-auto h-96 max-w-3xl rounded-lg" />;
  }
  if (query.isError) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {backLink}
        {isApiError(query.error, "NOT_FOUND") ? (
          <EmptyState icon={SearchX} title="Promo tidak ditemukan" description="Promo ini mungkin sudah dihapus." />
        ) : (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        )}
      </div>
    );
  }

  const promo = query.data;
  const initial: PromoInput = {
    title: promo.title,
    description: promo.description,
    image_url: promo.image_url,
    start_date: promo.start_date,
    end_date: promo.end_date,
    is_active: promo.is_active,
    treatment_ids: promo.treatments.map((treatment) => treatment.id),
  };

  async function handleUpdate(values: PromoInput) {
    const updated = await updatePromo(id, values);
    queryClient.setQueryData(adminPromoKey(id), updated);
    queryClient.invalidateQueries({ queryKey: adminPromosKey });
    toast.success("Promo disimpan.");
  }

  async function handleDelete() {
    await deletePromo(id);
    queryClient.removeQueries({ queryKey: adminPromoKey(id) });
    queryClient.invalidateQueries({ queryKey: adminPromosKey });
    toast.success("Promo dihapus.");
    router.replace("/admin/promo");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {backLink}
      <PageHeader
        title={promo.title}
        description={`Slug: ${promo.slug}`}
        actions={<PromoStateBadge state={promoState(promo, today)} />}
      />
      <SectionCard title="Data promo">
        <PromoForm key={promo.updated_at} initial={initial} submitLabel="Simpan Perubahan" onSubmit={handleUpdate} />
      </SectionCard>
      <DeleteSection
        entity="Promo"
        name={promo.title}
        description="Promo yang dihapus hilang dari situs. Untuk menyembunyikan sementara, nonaktifkan saja."
        onDelete={handleDelete}
      />
    </div>
  );
}
