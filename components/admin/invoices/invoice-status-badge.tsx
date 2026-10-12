import { invoiceStatusLabel, type InvoiceStatus } from "@/lib/api/admin-invoices";
import { cn } from "@/lib/utils";

const statusClass: Record<InvoiceStatus, string> = {
  unpaid: "bg-warning-bg text-warning",
  paid: "bg-success-bg text-success",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", statusClass[status])}
    >
      {invoiceStatusLabel[status]}
    </span>
  );
}
