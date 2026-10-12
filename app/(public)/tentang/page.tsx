import type { Metadata } from "next";
import { SectionHeading } from "@/components/catalog/section-heading";
import { TherapistGrid } from "@/components/catalog/therapist-grid";
import { WhyUs } from "@/components/catalog/why-us";
import { ClinicLocation } from "@/components/catalog/clinic-location";
import { getClinic, getTherapists } from "@/lib/api/catalog";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Kenali Lumière Aesthetic Clinic serta dokter dan terapis yang menangani perawatan Anda.",
};

export default async function AboutPage() {
  const [therapists, clinic] = await Promise.all([getTherapists(), getClinic()]);

  return (
    <>
      <section className="bg-sage-50 py-12 lg:py-20">
        <div className="container-page space-y-6">
          <SectionHeading
            as="h1"
            overline="Tentang Kami"
            title="Perawatan yang tenang, hasil yang terjaga"
          />
          <div className="max-w-prose space-y-4 text-[17px] leading-relaxed text-neutral-700 lg:text-lg">
            <p>
              Lumière Aesthetic Clinic hadir untuk Anda yang ingin merawat kulit dengan cara yang aman
              dan nyaman. Kami percaya perawatan kecantikan sebaiknya terasa menenangkan, bukan
              membingungkan.
            </p>
            <p>
              Setiap kunjungan dimulai dari memahami kebutuhan kulit Anda, lalu ditangani oleh tenaga
              yang berpengalaman di bidangnya.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-card py-12 lg:py-20">
        <div className="container-page space-y-10">
          <SectionHeading overline="Nilai Kami" title="Yang kami jaga" />
          <WhyUs />
        </div>
      </section>

      {clinic && (clinic.address || clinic.opening_hours_text) && <ClinicLocation clinic={clinic} />}

      <section className="py-12 lg:py-20">
        <div className="container-page space-y-8">
          <SectionHeading
            overline="Tim Kami"
            title="Dokter & terapis"
            description="Tenaga berpengalaman yang siap mendampingi perawatan Anda."
          />
          <TherapistGrid therapists={therapists} showBio />
        </div>
      </section>
    </>
  );
}
