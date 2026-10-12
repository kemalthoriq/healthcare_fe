import type { Metadata } from "next";
import { TreatmentsPage } from "@/components/admin/catalog/treatments-page";

export const metadata: Metadata = {
  title: "Treatment",
};

export default function AdminTreatmentsPage() {
  return <TreatmentsPage />;
}
