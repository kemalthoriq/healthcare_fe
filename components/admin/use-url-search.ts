"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SEARCH_DELAY_MS = 300;

export function useUrlSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();

  const [input, setInput] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    setSyncedQ(q);
    if (input.trim() !== q) {
      setInput(q);
    }
  }

  useEffect(() => {
    const value = input.trim();
    if (value === q) {
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) {
        next.set("q", value);
      } else {
        next.delete("q");
      }
      next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [input, q, pathname, router, searchParams]);

  function updateParams(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }
    if (!("page" in changes)) {
      next.delete("page");
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return { q, input, setInput, searchParams, updateParams };
}
