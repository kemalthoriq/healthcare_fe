import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "@/lib/api/client";

export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): string | null {
  if (!isApiError(error)) {
    return "Perubahan belum tersimpan. Silakan coba lagi.";
  }
  if (error.code !== "VALIDATION_ERROR") {
    return error.message;
  }
  let unmatched = false;
  let focused = false;
  for (const [field, message] of Object.entries(error.fields)) {
    if ((fields as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: "server", message }, { shouldFocus: !focused });
      focused = true;
    } else {
      unmatched = true;
    }
  }
  return unmatched || !focused ? error.message : null;
}
