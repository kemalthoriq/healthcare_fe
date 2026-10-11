import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageMeta } from "@/lib/api/client";

type PaginationProps = {
  meta: PageMeta;
  onPageChange: (page: number) => void;
};

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.per_page));
  if (totalPages <= 1) {
    return null;
  }
  const from = (meta.page - 1) * meta.per_page + 1;
  const to = Math.min(meta.page * meta.per_page, meta.total);

  return (
    <nav aria-label="Paginasi" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {from}–{to} dari {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft aria-hidden="true" strokeWidth={1.75} />
          Sebelumnya
        </Button>
        <span className="text-sm text-neutral-700">
          {meta.page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={meta.page >= totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Berikutnya
          <ChevronRight aria-hidden="true" strokeWidth={1.75} />
        </Button>
      </div>
    </nav>
  );
}
