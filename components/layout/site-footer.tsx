import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { publicNavItems } from "@/components/layout/nav-items";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page grid gap-8 py-12 md:grid-cols-[2fr_1fr] md:py-16">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Perawatan wajah dan kulit yang tenang, aman, dan ditangani tenaga berpengalaman.
          </p>
        </div>
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
          © Lumière Aesthetic Clinic
        </p>
      </div>
    </footer>
  );
}
