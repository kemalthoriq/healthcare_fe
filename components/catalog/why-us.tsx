import { CalendarCheck, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

const points = [
  {
    icon: ShieldCheck,
    title: "Aman & higienis",
    description: "Prosedur mengikuti standar kebersihan klinik dengan produk yang jelas asal-usulnya.",
  },
  {
    icon: HeartHandshake,
    title: "Tenaga berpengalaman",
    description: "Setiap treatment ditangani dokter dan terapis yang terlatih di bidangnya.",
  },
  {
    icon: CalendarCheck,
    title: "Booking mudah",
    description: "Pilih treatment, terapis, dan jam yang tersedia langsung dari ponsel Anda.",
  },
  {
    icon: Sparkles,
    title: "Suasana menenangkan",
    description: "Ruang perawatan yang nyaman agar Anda bisa rileks selama treatment.",
  },
];

export function WhyUs() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {points.map(({ icon: Icon, title, description }) => (
        <li key={title} className="space-y-3">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-sage-100">
            <Icon aria-hidden="true" strokeWidth={1.75} className="size-6 text-sage-700" />
          </span>
          <h3 className="text-[17px] font-semibold lg:text-lg">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </li>
      ))}
    </ul>
  );
}
