import { formatRupiah } from "@/lib/format";

export function discountError(value: number, subtotal: number): string | null {
  if (!Number.isFinite(value)) {
    return "Diskon wajib diisi. Isi 0 bila tidak ada diskon.";
  }
  if (value > subtotal) {
    return `Diskon tidak boleh melebihi subtotal (${formatRupiah(subtotal)}).`;
  }
  return null;
}
