import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <Logo />
      <h1 className="type-h1 text-neutral-900">Halaman tidak ditemukan</h1>
      <p className="max-w-prose text-muted-foreground">
        Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
      </p>
      <Button asChild>
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
