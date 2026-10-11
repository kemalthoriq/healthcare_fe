"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, SearchX } from "lucide-react";
import { toast } from "sonner";
import { ActiveBadge } from "@/components/admin/active-badge";
import { DeleteSection } from "@/components/admin/catalog/delete-section";
import { TherapistAccountForm } from "@/components/admin/catalog/therapist-account-form";
import { TherapistForm } from "@/components/admin/catalog/therapist-form";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { EmptyState } from "@/components/catalog/empty-state";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminTherapistKey,
  adminTherapistsKey,
  createTherapist,
  createTherapistAccount,
  deleteTherapist,
  fetchAdminTherapist,
  updateTherapist,
  type TherapistInput,
} from "@/lib/api/admin-catalog";
import { isApiError } from "@/lib/api/client";

const backLink = (
  <Link
    href="/admin/terapis"
    className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-neutral-700 hover:text-sage-700"
  >
    <ArrowLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
    Daftar terapis
  </Link>
);

export function NewTherapist() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleCreate(values: TherapistInput) {
    const therapist = await createTherapist(values);
    queryClient.setQueryData(adminTherapistKey(therapist.id), therapist);
    queryClient.invalidateQueries({ queryKey: adminTherapistsKey });
    toast.success("Terapis ditambahkan.");
    router.replace(`/admin/terapis/${therapist.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {backLink}
      <PageHeader title="Tambah terapis" />
      <SectionCard title="Profil terapis">
        <TherapistForm submitLabel="Simpan Terapis" resetAfterSubmit onSubmit={handleCreate} />
      </SectionCard>
    </div>
  );
}

export function EditTherapist({ id }: { id: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: adminTherapistKey(id), queryFn: () => fetchAdminTherapist(id) });

  if (query.isPending) {
    return <Skeleton className="mx-auto h-96 max-w-3xl rounded-lg" />;
  }
  if (query.error) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {backLink}
        {isApiError(query.error, "NOT_FOUND") ? (
          <EmptyState icon={SearchX} title="Terapis tidak ditemukan" description="Terapis ini mungkin sudah dihapus." />
        ) : (
          <QueryError error={query.error} onRetry={() => query.refetch()} />
        )}
      </div>
    );
  }

  const therapist = query.data;
  const initial: TherapistInput = {
    name: therapist.name,
    title: therapist.title,
    bio: therapist.bio,
    photo_url: therapist.photo_url,
    is_active: therapist.is_active,
  };

  function store(updated: typeof therapist, message: string) {
    queryClient.setQueryData(adminTherapistKey(id), updated);
    queryClient.invalidateQueries({ queryKey: adminTherapistsKey });
    toast.success(message);
  }

  async function handleUpdate(values: TherapistInput) {
    store(await updateTherapist(id, values), "Profil terapis disimpan.");
  }

  async function handleCreateAccount(email: string, password: string) {
    store(await createTherapistAccount(id, email, password), "Akun login terapis dibuat.");
  }

  async function handleDelete() {
    await deleteTherapist(id);
    queryClient.removeQueries({ queryKey: adminTherapistKey(id) });
    queryClient.invalidateQueries({ queryKey: adminTherapistsKey });
    toast.success("Terapis dihapus.");
    router.replace("/admin/terapis");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {backLink}
      <PageHeader title={therapist.name} description={therapist.title} actions={<ActiveBadge active={therapist.is_active} />} />
      <SectionCard title="Profil terapis">
        <TherapistForm key={therapist.updated_at} initial={initial} submitLabel="Simpan Perubahan" onSubmit={handleUpdate} />
      </SectionCard>
      <SectionCard
        title="Akun login"
        description="Akun ini dipakai terapis untuk melihat booking miliknya dan menulis catatan treatment."
      >
        <TherapistAccountForm hasAccount={therapist.has_account} onCreate={handleCreateAccount} />
      </SectionCard>
      <DeleteSection entity="Terapis" name={therapist.name} onDelete={handleDelete} />
    </div>
  );
}
