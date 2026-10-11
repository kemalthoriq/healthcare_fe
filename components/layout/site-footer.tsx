import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { publicNavItems } from "@/components/layout/nav-items";
import { Button } from "@/components/ui/button";
import { getClinic } from "@/lib/api/catalog";
import { formatPhone } from "@/lib/format";
import { whatsAppUrl } from "@/lib/whatsapp";

export async function SiteFooter() {
  const clinic = await getClinic();
  const hasContact = !!clinic && !!(clinic.address || clinic.phone || clinic.email || clinic.whatsapp);

  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 md:py-16 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr]">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Perawatan wajah dan kulit yang tenang, aman, dan ditangani tenaga berpengalaman.
          </p>
          {clinic?.whatsapp && (
            <Button asChild variant="whatsapp" size="sm">
              <a href={whatsAppUrl(clinic.whatsapp)} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" strokeWidth={1.75} />
                Hubungi via WA
              </a>
            </Button>
          )}
        </div>

        {hasContact && (
          <div>
            <p className="type-overline text-neutral-600">Kontak</p>
            <ul className="mt-4 space-y-3 text-sm text-neutral-700">
              {clinic.address && (
                <li className="flex gap-2">
                  <MapPin aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-neutral-500" />
                  <span className="whitespace-pre-line">{clinic.address}</span>
                </li>
              )}
              {clinic.phone && (
                <li className="flex gap-2">
                  <Phone aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-neutral-500" />
                  <a href={`tel:${clinic.phone.replace(/[^\d+]/g, "")}`} className="hover:text-sage-700">
                    {clinic.phone}
                  </a>
                </li>
              )}
              {clinic.whatsapp && (
                <li className="flex gap-2">
                  <MessageCircle aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-neutral-500" />
                  <a
                    href={whatsAppUrl(clinic.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sage-700"
                  >
                    {formatPhone(clinic.whatsapp)}
                  </a>
                </li>
              )}
              {clinic.email && (
                <li className="flex gap-2">
                  <Mail aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-neutral-500" />
                  <a href={`mailto:${clinic.email}`} className="break-all hover:text-sage-700">
                    {clinic.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}

        {clinic?.opening_hours_text && (
          <div>
            <p className="type-overline text-neutral-600">Jam operasional</p>
            <p className="mt-4 flex gap-2 text-sm text-neutral-700">
              <Clock aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-neutral-500" />
              <span className="whitespace-pre-line">{clinic.opening_hours_text}</span>
            </p>
          </div>
        )}

        <nav aria-label="Navigasi footer">
          <p className="type-overline text-neutral-600">Jelajahi</p>
          <ul className="mt-4 flex flex-col gap-3">
            {publicNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-neutral-700 hover:text-sage-700">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/booking" className="text-sm text-neutral-700 hover:text-sage-700">
                Booking
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="container-page py-6 text-xs text-muted-foreground">
          © {clinic?.clinic_name || "Lumière Aesthetic Clinic"}
        </p>
      </div>
    </footer>
  );
}
