"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { QueryError } from "@/components/query-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminTherapistsKey,
  fetchAdminTherapists,
  fetchTreatmentTherapists,
  setTreatmentTherapists,
  treatmentTherapistsKey,
} from "@/lib/api/admin-catalog";
import { isApiError } from "@/lib/api/client";
import type { Therapist } from "@/lib/api/types";

function Editor({ treatmentId, therapists, assigned }: { treatmentId: number; therapists: Therapist[]; assigned: number[] }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number[]>(assigned);
  const [error, setError] = useState<string | null>(null);
  const changed = selected.length !== assigned.length || selected.some((id) => !assigned.includes(id));

  const mutation = useMutation({
    mutationFn: () => setTreatmentTherapists(treatmentId, selected),
    onSuccess: (result) => {
      setError(null);
      queryClient.setQueryData(treatmentTherapistsKey(treatmentId), result);
      toast.success("Daftar terapis disimpan.");
    },
    onError: (err) => {
      setError(isApiError(err) ? (err.fields.therapist_ids ?? err.message) : "Perubahan belum tersimpan.");
    },
  });

  function toggle(id: number, checked: boolean) {
    setSelected((current) => (checked ? [...current, id] : current.filter((value) => value !== id)));
  }

  if (therapists.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada terapis.{" "}
        <Link href="/admin/terapis/baru" className="font-semibold text-sage-700 hover:underline">
          Tambah terapis
        </Link>{" "}
        terlebih dahulu.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" strokeWidth={1.75} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <fieldset>
        <legend className="sr-only">Terapis yang menangani treatment ini</legend>
        <ul className="divide-y divide-border rounded-md border border-border">
          {therapists.map((therapist) => (
            <li key={therapist.id}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 py-2 hover:bg-neutral-50">
                <Checkbox
                  checked={selected.includes(therapist.id)}
                  onCheckedChange={(checked) => toggle(therapist.id, checked === true)}
                />
                <span className="flex-1 text-sm">
                  <span className="font-medium text-neutral-900">{therapist.name}</span>
                  {therapist.title && <span className="text-muted-foreground"> · {therapist.title}</span>}
                </span>
                {!therapist.is_active && <span className="text-xs text-muted-foreground">Nonaktif</span>}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => mutation.mutate()} disabled={!changed || mutation.isPending}>
          {mutation.isPending && <Loader2 aria-hidden="true" className="animate-spin" />}
          Simpan Terapis
        </Button>
        {changed && (
          <Button type="button" variant="ghost" onClick={() => setSelected(assigned)} disabled={mutation.isPending}>
            Batalkan perubahan
          </Button>
        )}
      </div>
    </div>
  );
}

export function TreatmentTherapistsEditor({ treatmentId }: { treatmentId: number }) {
  const therapistsQuery = useQuery({ queryKey: adminTherapistsKey, queryFn: fetchAdminTherapists });
  const assignedQuery = useQuery({
    queryKey: treatmentTherapistsKey(treatmentId),
    queryFn: () => fetchTreatmentTherapists(treatmentId),
  });

  if (therapistsQuery.isError || assignedQuery.isError) {
    return (
      <QueryError
        error={(therapistsQuery.error ?? assignedQuery.error)!}
        onRetry={() => {
          therapistsQuery.refetch();
          assignedQuery.refetch();
        }}
      />
    );
  }
  if (!therapistsQuery.isSuccess || !assignedQuery.isSuccess) {
    return <Skeleton className="h-40" />;
  }

  const assigned = assignedQuery.data.map((therapist) => therapist.id);
  return (
    <Editor
      key={assigned.join(",")}
      treatmentId={treatmentId}
      therapists={therapistsQuery.data}
      assigned={assigned}
    />
  );
}
