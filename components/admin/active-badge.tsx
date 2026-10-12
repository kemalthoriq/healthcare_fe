import { cn } from "@/lib/utils";

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        active ? "bg-success-bg text-success" : "bg-neutral-100 text-neutral-700",
      )}
    >
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}
