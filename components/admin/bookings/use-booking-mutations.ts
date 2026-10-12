"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminBookingKey,
  adminBookingsKey,
  cancelAdminBooking,
  rescheduleAdminBooking,
  runBookingAction,
  saveTreatmentNote,
  type AdminBooking,
  type BookingAction,
} from "@/lib/api/admin-bookings";
import { adminDashboardKey } from "@/lib/api/admin-dashboard";
import { isApiError } from "@/lib/api/client";

const RELOAD_CODES = ["STATUS_CHANGED", "INVALID_TRANSITION", "SLOT_TAKEN", "SLOT_UNAVAILABLE"];

const actionMessages: Record<BookingAction, string> = {
  confirm: "Booking dikonfirmasi.",
  complete: "Booking ditandai selesai.",
  "no-show": "Booking ditandai tidak datang.",
};

export function useBookingMutations(id: number) {
  const queryClient = useQueryClient();

  function onSuccess(message: string) {
    return (booking: AdminBooking) => {
      queryClient.setQueryData(adminBookingKey(id), booking);
      queryClient.invalidateQueries({ queryKey: adminBookingsKey });
      queryClient.invalidateQueries({ queryKey: adminDashboardKey });
      toast.success(message);
    };
  }

  function onError(error: Error) {
    if (!isApiError(error)) {
      toast.error("Perubahan belum tersimpan. Silakan coba lagi.");
      return;
    }
    if (error.status === 401) {
      return;
    }
    toast.error(error.fields.reason ?? error.fields.content ?? error.fields.start_at ?? error.message);
    if (RELOAD_CODES.includes(error.code)) {
      queryClient.invalidateQueries({ queryKey: adminBookingKey(id) });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["available-dates"] });
    }
  }

  const action = useMutation({
    mutationFn: (value: BookingAction) => runBookingAction(id, value),
    onSuccess: (booking, value) => onSuccess(actionMessages[value])(booking),
    onError,
  });

  const cancel = useMutation({
    mutationFn: (reason: string) => cancelAdminBooking(id, reason),
    onSuccess: onSuccess("Booking dibatalkan."),
    onError,
  });

  const reschedule = useMutation({
    mutationFn: (startAt: string) => rescheduleAdminBooking(id, startAt),
    onSuccess: (booking) => {
      onSuccess("Jadwal booking diperbarui.")(booking);
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["available-dates"] });
    },
    onError,
  });

  const note = useMutation({
    mutationFn: (content: string) => saveTreatmentNote(id, content),
    onSuccess: onSuccess("Catatan treatment disimpan."),
    onError,
  });

  return { action, cancel, reschedule, note };
}
