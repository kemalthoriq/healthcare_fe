import type { Metadata } from "next";
import { PromosPage } from "@/components/admin/promos/promos-page";

export const metadata: Metadata = {
  title: "Promo",
};

export default function AdminPromosPage() {
  return <PromosPage />;
}
