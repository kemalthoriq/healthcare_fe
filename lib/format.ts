export const TIME_ZONE = "Asia/Jakarta";
const LOCALE = "id-ID";

const numberFormat = new Intl.NumberFormat(LOCALE);
const longDateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortDateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});
const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function toDate(value: string | Date): Date {
  if (value instanceof Date) {
    return value;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00+07:00`);
  }
  return new Date(value);
}

export function formatRupiah(amount: number): string {
  return `Rp ${numberFormat.format(amount)}`;
}

export function formatDateLong(value: string | Date): string {
  return longDateFormat.format(toDate(value));
}

export function formatDateShort(value: string | Date): string {
  return shortDateFormat.format(toDate(value)).replace(/\./g, "");
}

export function formatTime(value: string | Date): string {
  return `${timeFormat.format(toDate(value)).replace(":", ".")} WIB`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} menit`;
  }
  return rest === 0 ? `${hours} jam` : `${hours} jam ${rest} menit`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("62") ? digits.slice(2) : digits.replace(/^0/, "");
  const groups = [local.slice(0, 3), local.slice(3, 7), local.slice(7)].filter(Boolean);
  return `+62 ${groups.join("-")}`;
}
