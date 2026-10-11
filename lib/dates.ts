import { TIME_ZONE } from "@/lib/format";

const dateKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toDateKey(date: Date): string {
  return dateKeyFormat.format(date);
}

export function toMonthKey(date: Date): string {
  return toDateKey(date).slice(0, 7);
}

export function fromDateKey(key: string): Date {
  return new Date(`${key}T12:00:00+07:00`);
}

export function fromMonthKey(key: string): Date {
  return fromDateKey(`${key}-01`);
}

export function addMonths(monthKey: string, amount: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const index = year * 12 + (month - 1) + amount;
  const nextYear = Math.floor(index / 12);
  const nextMonth = (index % 12) + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}

export function isDateKey(value: string | null): value is string {
  return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isTimeKey(value: string | null): value is string {
  return value !== null && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function toStartAt(date: string, time: string): string {
  return `${date}T${time}:00+07:00`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}.${String(total % 60).padStart(2, "0")}`;
}

export type DayPeriod = "pagi" | "siang" | "sore";

export function dayPeriod(time: string): DayPeriod {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) {
    return "pagi";
  }
  return hour < 15 ? "siang" : "sore";
}
