import { api } from "@/lib/api/client";

export type InvoiceStatus = "unpaid" | "paid";

export type PaymentMethod = "cash" | "transfer";

export type AdminInvoice = {
  id: number;
  number: string;
  booking_id: number;
  booking_code: string;
  booking_start_at: string;
  patient_name: string;
  patient_phone: string;
  treatment_name: string;
  therapist_name: string;
  subtotal: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  payment_method: PaymentMethod | "";
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminInvoiceFilters = {
  status?: InvoiceStatus;
  booking_id?: number;
  q?: string;
  page?: number;
  per_page?: number;
};

export const INVOICE_QUERY_MAX_LENGTH = 100;

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  unpaid: "Belum Dibayar",
  paid: "Lunas",
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  cash: "Tunai",
  transfer: "Transfer",
};

export const adminInvoicesKey = ["admin-invoices"] as const;

export function adminInvoiceKey(id: number) {
  return ["admin-invoice", id] as const;
}

export function fetchAdminInvoices(filters: AdminInvoiceFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return api.list<AdminInvoice>(`/admin/invoices${query ? `?${query}` : ""}`);
}

export function fetchAdminInvoice(id: number) {
  return api.get<AdminInvoice>(`/admin/invoices/${id}`);
}

export function createInvoice(bookingId: number, discount: number) {
  return api.post<AdminInvoice>(`/admin/bookings/${bookingId}/invoice`, { discount });
}

export function updateInvoiceDiscount(id: number, discount: number) {
  return api.patch<AdminInvoice>(`/admin/invoices/${id}`, { discount });
}

export function payInvoice(id: number, paymentMethod: PaymentMethod) {
  return api.post<AdminInvoice>(`/admin/invoices/${id}/pay`, { payment_method: paymentMethod });
}
