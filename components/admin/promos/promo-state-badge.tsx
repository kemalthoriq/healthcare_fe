import type { PromoState } from "@/lib/api/admin-promos";
import { cn } from "@/lib/utils";

const labels: Record<PromoState, string> = {
  live: "Tayang",
  scheduled: "Terjadwal",
  ended: "Berakhir",
  inactive: "Nonaktif",
};

const classes: Record<PromoState, string> = {
  live: "bg-success-bg text-success",
  scheduled: "bg-info-bg text-info",
  ended: "bg-neutral-100 text-neutral-700",
  inactive: "bg-neutral-100 text-neutral-700",
};

export function PromoStateBadge({ state }: { state: PromoState }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", classes[state])}>
      {labels[state]}
    </span>
  );
}
