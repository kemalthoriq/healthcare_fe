import type { Metadata } from "next";
import { NewPromo } from "@/components/admin/promos/promo-editor";

export const metadata: Metadata = {
  title: "Tambah Promo",
};

export default function AdminNewPromoPage() {
  return <NewPromo />;
}
