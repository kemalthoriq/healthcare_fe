import { TriangleAlert } from "lucide-react";

export function NeedsActionBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger">
      <TriangleAlert aria-hidden="true" strokeWidth={2} className="size-3.5" />
      Perlu Tindakan
    </span>
  );
}
