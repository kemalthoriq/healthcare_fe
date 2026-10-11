import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { publicNavItems } from "@/components/layout/nav-items";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Logo />
        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {publicNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm text-[15px] font-medium text-neutral-700 transition-colors duration-150 hover:text-sage-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="md:hidden">
            <Link href="/booking">Booking</Link>
          </Button>
          <Button asChild className="hidden md:inline-flex">
            <Link href="/booking">Booking Sekarang</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
