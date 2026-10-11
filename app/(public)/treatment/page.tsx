import type { Metadata } from "next";
import { SectionHeading } from "@/components/catalog/section-heading";
import { TreatmentGrid } from "@/components/catalog/treatment-grid";
import { getTreatments } from "@/lib/api/catalog";

export const metadata: Metadata = {
  title: "Treatment",
  description: "Daftar treatment wajah dan kulit di Lumière Aesthetic Clinic beserta harga dan durasinya.",
};

export default async function TreatmentListPage() {
  const treatments = await getTreatments();

  return (
    <section className="py-12 lg:py-20">
      <div className="container-page space-y-10">
        <SectionHeading
          as="h1"
          overline="Treatment"
          title="Pilih perawatan Anda"
          description="Lihat harga dan durasi setiap treatment, lalu booking di jam yang Anda inginkan."
        />
        <TreatmentGrid treatments={treatments} />
      </div>
    </section>
  );
}
