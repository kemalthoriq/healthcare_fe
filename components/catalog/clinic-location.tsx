import { Clock, ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/catalog/section-heading";
import { Button } from "@/components/ui/button";
import type { PublicClinic } from "@/lib/api/types";
import { whatsAppUrl } from "@/lib/whatsapp";

export function ClinicLocation({ clinic }: { clinic: PublicClinic }) {
  const mapsUrl = clinic.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`
    : null;

  return (
    <section className="bg-sage-50 py-12 lg:py-20">
      <div className="container-page space-y-8">
        <SectionHeading overline="Kunjungi Kami" title="Lokasi & jam operasional" />
        <div className="grid gap-6 md:grid-cols-2">
          {clinic.address && (
            <div className="space-y-4 rounded-lg bg-card p-6 shadow-sm">
              <p className="flex items-center gap-2 font-semibold text-neutral-900">
                <MapPin aria-hidden="true" strokeWidth={1.75} className="size-5 text-sage-600" />
                Alamat
              </p>
              <p className="leading-relaxed whitespace-pre-line text-neutral-700">{clinic.address}</p>
              <div className="flex flex-wrap gap-2">
                {mapsUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                      Buka di Google Maps
                      <ExternalLink aria-hidden="true" strokeWidth={1.75} />
                    </a>
                  </Button>
                )}
                {clinic.whatsapp && (
                  <Button asChild variant="whatsapp" size="sm">
                    <a href={whatsAppUrl(clinic.whatsapp)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle aria-hidden="true" strokeWidth={1.75} />
                      Hubungi via WA
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
          {clinic.opening_hours_text && (
            <div className="space-y-4 rounded-lg bg-card p-6 shadow-sm">
              <p className="flex items-center gap-2 font-semibold text-neutral-900">
                <Clock aria-hidden="true" strokeWidth={1.75} className="size-5 text-sage-600" />
                Jam operasional
              </p>
              <p className="leading-relaxed whitespace-pre-line text-neutral-700">{clinic.opening_hours_text}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
