"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { SectionCard } from "@/components/admin/section-card";
import { BookingSettingsForm } from "@/components/admin/settings/booking-settings-form";
import { ClinicInfoForm } from "@/components/admin/settings/clinic-info-form";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import {
  bookingSettingsKey,
  clinicInfoKey,
  fetchBookingSettings,
  fetchClinicInfo,
  saveBookingSettings,
  saveClinicInfo,
  type BookingSettingsInput,
  type ClinicInfoInput,
} from "@/lib/api/admin-settings";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: bookingSettingsKey, queryFn: fetchBookingSettings });
  const clinicQuery = useQuery({ queryKey: clinicInfoKey, queryFn: fetchClinicInfo });

  async function handleSettings(values: BookingSettingsInput) {
    queryClient.setQueryData(bookingSettingsKey, await saveBookingSettings(values));
    toast.success("Aturan booking disimpan.");
  }

  async function handleClinic(values: ClinicInfoInput) {
    queryClient.setQueryData(clinicInfoKey, await saveClinicInfo(values));
    toast.success("Info klinik disimpan.");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Perubahan di situs publik terlihat paling lama sekitar 1 menit setelah disimpan."
      />

      <SectionCard title="Aturan booking">
        {settingsQuery.isError ? (
          <QueryError error={settingsQuery.error} onRetry={() => settingsQuery.refetch()} />
        ) : !settingsQuery.isSuccess ? (
          <Skeleton className="h-64" />
        ) : (
          <BookingSettingsForm
            key={settingsQuery.data.updated_at}
            initial={{
              buffer_minutes: settingsQuery.data.buffer_minutes,
              min_booking_lead_minutes: settingsQuery.data.min_booking_lead_minutes,
              max_booking_days_ahead: settingsQuery.data.max_booking_days_ahead,
              cancel_deadline_hours: settingsQuery.data.cancel_deadline_hours,
            }}
            onSubmit={handleSettings}
          />
        )}
      </SectionCard>

      <SectionCard title="Info klinik" description="Ditampilkan di footer, halaman Tentang, dan tombol WhatsApp.">
        {clinicQuery.isError ? (
          <QueryError error={clinicQuery.error} onRetry={() => clinicQuery.refetch()} />
        ) : !clinicQuery.isSuccess ? (
          <Skeleton className="h-96" />
        ) : (
          <ClinicInfoForm
            key={clinicQuery.data.updated_at}
            initial={{
              clinic_name: clinicQuery.data.clinic_name,
              address: clinicQuery.data.address,
              phone: clinicQuery.data.phone,
              whatsapp: clinicQuery.data.whatsapp,
              email: clinicQuery.data.email,
              opening_hours_text: clinicQuery.data.opening_hours_text,
            }}
            onSubmit={handleClinic}
          />
        )}
      </SectionCard>
    </div>
  );
}
