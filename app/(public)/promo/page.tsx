import type { Metadata } from "next";
import Link from "next/link";
import { Tag } from "lucide-react";
import { EmptyState } from "@/components/catalog/empty-state";
import { PromoCard } from "@/components/catalog/promo-card";
import { SectionHeading } from "@/components/catalog/section-heading";
import { Button } from "@/components/ui/button";
import { getPromos } from "@/lib/api/catalog";

export const metadata: Metadata = {
  title: "Promo",
  description: "Promo treatment yang sedang berlaku di Lumière Aesthetic Clinic.",
};

export default async function PromoPage() {
  const promos = await getPromos();

  return (
    <section className="bg-blush-50 py-12 lg:py-20">
      <div className="container-page space-y-10">
        <SectionHeading
          as="h1"
          overline="Promo"
          title="Penawaran yang sedang berlaku"
          description="Promo berlaku sesuai periode masing-masing. Pilih treatment terkait lalu booking jadwal Anda."
        />
        {promos.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="Belum ada promo saat ini"
            description="Nantikan penawaran berikutnya. Sementara itu, Anda tetap bisa melihat semua treatment kami."
          >
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/treatment">Lihat Treatment</Link>
            </Button>
          </EmptyState>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {promos.map((promo) => (
              <li key={promo.id} className="flex [&>article]:w-full">
                <PromoCard promo={promo} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
