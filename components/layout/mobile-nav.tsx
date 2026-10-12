"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { publicNavItems } from "@/components/layout/nav-items";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu">
          <Menu strokeWidth={1.75} className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] max-w-xs bg-card">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl font-normal text-sage-700">Menu</SheetTitle>
          <SheetDescription className="sr-only">Navigasi halaman Lumière</SheetDescription>
        </SheetHeader>
        <nav aria-label="Navigasi seluler" className="px-4">
          <ul className="flex flex-col gap-1">
            {publicNavItems.map((item) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className="flex h-11 items-center rounded-md px-3 text-base font-medium text-neutral-700 hover:bg-sage-50 hover:text-sage-700"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto p-4">
          <SheetClose asChild>
            <Button asChild className="w-full">
              <Link href="/booking">Booking Sekarang</Link>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
