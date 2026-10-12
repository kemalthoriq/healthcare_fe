import type { Metadata } from "next";
import { TherapistsPage } from "@/components/admin/catalog/therapists-page";

export const metadata: Metadata = {
  title: "Terapis",
};

export default function AdminTherapistsPage() {
  return <TherapistsPage />;
}
