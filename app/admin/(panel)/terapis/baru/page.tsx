import type { Metadata } from "next";
import { NewTherapist } from "@/components/admin/catalog/therapist-editor";

export const metadata: Metadata = {
  title: "Tambah Terapis",
};

export default function AdminNewTherapistPage() {
  return <NewTherapist />;
}
