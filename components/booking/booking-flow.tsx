"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookingSummary } from "@/components/booking/booking-summary";
import { DateStep } from "@/components/booking/date-step";
import {
  DetailsStep,
  emptyDetails,
  type DetailsField,
  type DetailsInput,
  type DetailsValues,
} from "@/components/booking/details-step";
import { Stepper } from "@/components/booking/stepper";
import { TherapistStep } from "@/components/booking/therapist-step";
import { TimeStep, slotsQueryKey } from "@/components/booking/time-step";
import { TreatmentStep } from "@/components/booking/treatment-step";
import { Skeleton } from "@/components/ui/skeleton";
import { createBooking, fetchTreatmentTherapists } from "@/lib/api/booking";
import { isApiError } from "@/lib/api/client";
import type { Treatment } from "@/lib/api/types";
import { isDateKey, isTimeKey, toStartAt } from "@/lib/dates";

const PARAM_ORDER = ["treatment", "therapist", "date", "time"] as const;
type Param = (typeof PARAM_ORDER)[number];

const DETAIL_FIELDS: DetailsField[] = ["name", "phone", "email", "note", "consent"];

export function BookingFlow({ treatments }: { treatments: Treatment[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState<DetailsInput>(emptyDetails);
  const [serverErrors, setServerErrors] = useState<Partial<Record<DetailsField, string>>>({});

  const treatment = treatments.find((item) => item.slug === searchParams.get("treatment")) ?? null;
  const therapistSlug = treatment ? searchParams.get("therapist") : null;

  const therapistsQuery = useQuery({
    queryKey: ["treatment-therapists", treatment?.slug],
    queryFn: () => fetchTreatmentTherapists(treatment!.slug),
    enabled: treatment !== null,
  });

  const therapist = therapistsQuery.data?.find((item) => item.slug === therapistSlug) ?? null;
  const rawDate = searchParams.get("date");
  const date = therapist && isDateKey(rawDate) ? rawDate : null;
  const rawTime = searchParams.get("time");
  const time = date && isTimeKey(rawTime) ? rawTime : null;

  const step = !treatment ? 0 : !therapist ? 1 : !date ? 2 : !time ? 3 : 4;
  const resolvingTherapist = therapistSlug !== null && therapistsQuery.isPending;

  const go = useCallback(
    (key: Param, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      const index = PARAM_ORDER.indexOf(key);
      PARAM_ORDER.slice(index).forEach((param) => next.delete(param));
      if (value !== null) {
        next.set(key, value);
      }
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => {
      toast.dismiss();
      router.push(`/booking/${booking.code}?baru=1`);
    },
    onError: (error) => {
      if (!isApiError(error)) {
        toast.error("Booking belum berhasil dikirim. Silakan coba lagi.");
        return;
      }
      if (error.code === "SLOT_TAKEN" || error.code === "SLOT_UNAVAILABLE") {
        toast.error(error.message);
        if (treatment && therapist && date) {
          queryClient.invalidateQueries({ queryKey: slotsQueryKey(treatment.slug, therapist.slug, date) });
        }
        go("time", null);
        return;
      }
      if (error.code === "THERAPIST_NOT_ASSIGNED") {
        toast.error(error.message);
        queryClient.invalidateQueries({ queryKey: ["treatment-therapists"] });
        go("therapist", null);
        return;
      }
      if (error.code === "VALIDATION_ERROR") {
        const fieldErrors = Object.fromEntries(
          Object.entries(error.fields).filter(([field]) => DETAIL_FIELDS.includes(field as DetailsField)),
        ) as Partial<Record<DetailsField, string>>;
        setServerErrors(fieldErrors);
        if (Object.keys(fieldErrors).length < Object.keys(error.fields).length) {
          toast.error(error.message);
        }
        return;
      }
      toast.error(error.message);
    },
  });

  function handleSubmit(values: DetailsValues) {
    if (!treatment || !therapist || !date || !time) {
      return;
    }
    setServerErrors({});
    mutation.mutate({
      treatment_slug: treatment.slug,
      therapist_slug: therapist.slug,
      start_at: toStartAt(date, time),
      name: values.name,
      phone: `62${values.phone}`,
      email: values.email,
      note: values.note,
      consent: values.consent,
    });
  }

  return (
    <div className="space-y-8">
      <Stepper current={step} />

      {resolvingTherapist ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat pilihan booking">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      ) : step === 0 ? (
        <TreatmentStep
          treatments={treatments}
          selected={treatment?.slug ?? null}
          onSelect={(slug) => go("treatment", slug)}
        />
      ) : step === 1 ? (
        <TherapistStep
          therapists={therapistsQuery.data}
          isPending={therapistsQuery.isPending}
          error={therapistsQuery.error}
          onRetry={() => therapistsQuery.refetch()}
          selected={therapistSlug}
          onSelect={(slug) => go("therapist", slug)}
          onBack={() => go("treatment", null)}
        />
      ) : step === 2 ? (
        <DateStep
          key={therapist!.slug}
          treatment={treatment!.slug}
          therapist={therapist!.slug}
          therapistName={therapist!.name}
          selected={date}
          onSelect={(value) => go("date", value)}
          onBack={() => go("therapist", null)}
        />
      ) : step === 3 ? (
        <TimeStep
          treatment={treatment!.slug}
          therapist={therapist!}
          therapists={therapistsQuery.data ?? []}
          date={date!}
          selected={time}
          onSelect={(value) => go("time", value)}
          onPickTherapist={(slug) => {
            const next = new URLSearchParams(searchParams.toString());
            next.set("therapist", slug);
            next.delete("time");
            router.push(`${pathname}?${next.toString()}`);
          }}
          onPickDate={() => go("date", null)}
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="lg:order-2 lg:sticky lg:top-28">
            <BookingSummary treatment={treatment!} therapist={therapist!} date={date!} time={time!} />
          </div>
          <div className="lg:order-1">
            <DetailsStep
              defaultValues={draft}
              serverErrors={serverErrors}
              submitting={mutation.isPending || mutation.isSuccess}
              onChange={setDraft}
              onSubmit={handleSubmit}
              onBack={() => go("time", null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
