export const WEEK_DAYS = [
  { day: 1, label: "Senin" },
  { day: 2, label: "Selasa" },
  { day: 3, label: "Rabu" },
  { day: 4, label: "Kamis" },
  { day: 5, label: "Jumat" },
  { day: 6, label: "Sabtu" },
  { day: 0, label: "Minggu" },
] as const;

export const CLOCK_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, "0");
  return `${hour}:${index % 2 === 0 ? "00" : "30"}`;
});

export function clockLabel(value: string): string {
  return value.replace(":", ".");
}

export function fromWibDateTimeLocal(value: string): string {
  return `${value}:00+07:00`;
}
