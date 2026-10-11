import type { Therapist, Treatment } from "@/lib/api/types";
import { addMinutesToTime } from "@/lib/dates";
import { formatDateLong, formatDuration, formatRupiah } from "@/lib/format";

type BookingSummaryProps = {
  treatment: Treatment;
  therapist: Therapist;
  date: string;
  time: string;
};

export function BookingSummary({ treatment, therapist, date, time }: BookingSummaryProps) {
  const rows = [
    { label: "Treatment", value: treatment.name },
    { label: "Terapis", value: therapist.name },
    { label: "Tanggal", value: formatDateLong(date) },
    {
      label: "Jam",
      value: `${time.replace(":", ".")}–${addMinutesToTime(time, treatment.duration_minutes)} WIB`,
    },
    { label: "Durasi", value: formatDuration(treatment.duration_minutes) },
  ];

  return (
    <section aria-labelledby="ringkasan-heading" className="rounded-lg bg-card p-6 shadow-sm">
      <h2 id="ringkasan-heading" className="text-[17px] font-semibold">
        Ringkasan booking
      </h2>
      <dl className="mt-4 space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-medium text-neutral-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Harga</span>
        <span className="text-lg font-semibold text-neutral-900">{formatRupiah(treatment.price)}</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Pembayaran dilakukan di klinik setelah treatment.</p>
    </section>
  );
}
