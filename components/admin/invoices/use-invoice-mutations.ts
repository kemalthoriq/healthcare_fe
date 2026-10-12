"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminBookingKey } from "@/lib/api/admin-bookings";
import { adminDashboardKey } from "@/lib/api/admin-dashboard";
import {
  adminInvoiceKey,
  adminInvoicesKey,
  createInvoice,
  payInvoice,
  updateInvoiceDiscount,
  type AdminInvoice,
  type PaymentMethod,
} from "@/lib/api/admin-invoices";
import { isApiError } from "@/lib/api/client";

function useInvoiceErrorHandler() {
  const queryClient = useQueryClient();

  return (error: Error, reload: () => void) => {
    if (!isApiError(error)) {
      toast.error("Perubahan belum tersimpan. Silakan coba lagi.");
      return;
    }
    if (error.status === 401) {
      return;
    }
    toast.error(error.fields.discount ?? error.fields.payment_method ?? error.message);
    if (error.code !== "VALIDATION_ERROR" && [404, 409, 422].includes(error.status)) {
      reload();
      queryClient.invalidateQueries({ queryKey: adminInvoicesKey });
    }
  };
}

function useSaveInvoice() {
  const queryClient = useQueryClient();

  return (invoice: AdminInvoice) => {
    queryClient.setQueryData(adminInvoiceKey(invoice.id), invoice);
    queryClient.invalidateQueries({ queryKey: adminInvoicesKey });
    queryClient.invalidateQueries({ queryKey: adminDashboardKey });
  };
}

export function useInvoiceMutations(id: number) {
  const queryClient = useQueryClient();
  const handleError = useInvoiceErrorHandler();
  const save = useSaveInvoice();
  const reload = () => queryClient.invalidateQueries({ queryKey: adminInvoiceKey(id) });

  const discount = useMutation({
    mutationFn: (value: number) => updateInvoiceDiscount(id, value),
    onSuccess: (invoice) => {
      save(invoice);
      toast.success("Diskon disimpan.");
    },
    onError: (error) => handleError(error, reload),
  });

  const pay = useMutation({
    mutationFn: (method: PaymentMethod) => payInvoice(id, method),
    onSuccess: (invoice) => {
      save(invoice);
      toast.success("Pembayaran dicatat. Invoice lunas.");
    },
    onError: (error) => handleError(error, reload),
  });

  return { discount, pay };
}

export function useCreateInvoice(bookingId: number) {
  const queryClient = useQueryClient();
  const handleError = useInvoiceErrorHandler();
  const save = useSaveInvoice();

  return useMutation({
    mutationFn: (discount: number) => createInvoice(bookingId, discount),
    onSuccess: (invoice) => {
      save(invoice);
      toast.success(`Invoice ${invoice.number} dibuat.`);
    },
    onError: (error) =>
      handleError(error, () => queryClient.invalidateQueries({ queryKey: adminBookingKey(bookingId) })),
  });
}
