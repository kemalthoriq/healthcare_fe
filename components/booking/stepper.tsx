import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const BOOKING_STEPS = ["Treatment", "Terapis", "Tanggal", "Jam", "Data Diri"] as const;

const STEP_TITLES = ["Pilih Treatment", "Pilih Terapis", "Pilih Tanggal", "Pilih Jam", "Isi Data Diri"];

export function Stepper({ current }: { current: number }) {
  const total = BOOKING_STEPS.length;

  return (
    <div>
      <div className="md:hidden">
        <p className="text-sm font-medium text-neutral-700">
          Langkah {current + 1} dari {total} · {STEP_TITLES[current]}
        </p>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={current + 1}
          aria-label="Progres booking"
        >
          <div
            className="h-full rounded-full bg-sage-600 transition-[width] duration-300 ease-slow"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <ol className="hidden items-start md:flex" aria-label="Langkah booking">
        {BOOKING_STEPS.map((label, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={label} className="flex flex-1 flex-col items-center gap-2 last:flex-none">
              <div className="flex w-full items-center">
                <span
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    done && "border-sage-600 bg-sage-600 text-white",
                    active && "border-sage-600 bg-card text-sage-700 ring-4 ring-sage-100",
                    !done && !active && "border-neutral-300 bg-card text-neutral-500",
                  )}
                >
                  {done ? <Check aria-hidden="true" strokeWidth={2.5} className="size-4" /> : index + 1}
                </span>
                {index < total - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn("mx-2 h-0.5 flex-1 rounded-full", done ? "bg-sage-600" : "bg-neutral-300")}
                  />
                )}
              </div>
              <span
                className={cn(
                  "self-start text-xs font-medium",
                  active ? "text-sage-700" : "text-neutral-600",
                )}
              >
                {label}
                <span className="sr-only">{done ? " (selesai)" : active ? " (langkah saat ini)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
