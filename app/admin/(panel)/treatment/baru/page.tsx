import type { Metadata } from "next";
import { NewTreatment } from "@/components/admin/catalog/treatment-editor";

export const metadata: Metadata = {
  title: "Tambah Treatment",
};

export default function AdminNewTreatmentPage() {
  return <NewTreatment />;
}
