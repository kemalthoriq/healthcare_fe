import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ChoiceCardProps = {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  className?: string;
};

export function ChoiceCard({ selected, onSelect, children, className }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex w-full items-center gap-4 rounded-lg border bg-card p-4 text-left shadow-xs transition-colors duration-150 outline-none hover:border-sage-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected ? "border-sage-600 bg-sage-50" : "border-neutral-200",
        className,
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "ml-auto flex size-6 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-sage-600 bg-sage-600 text-white" : "border-neutral-300",
        )}
      >
        {selected && <Check strokeWidth={3} className="size-3.5" />}
      </span>
    </button>
  );
}
