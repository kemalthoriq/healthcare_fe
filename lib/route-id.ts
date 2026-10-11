import { notFound } from "next/navigation";

export function parseRouteId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }
  return id;
}
