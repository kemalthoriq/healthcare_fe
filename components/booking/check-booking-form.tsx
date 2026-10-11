"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CheckBookingForm() {
  const uid = useId();
  const f = (name: string) => `${uid}-${name}`;
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value) {
      setError("Kode booking wajib diisi.");
      return;
    }
    setError("");
    router.push(`/booking/${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <Label htmlFor={f("booking-code")}>Sudah punya kode booking?</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={f("booking-code")}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="LMR-XXXX-XXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={!!error}
          aria-describedby={error ? f("booking-code-error") : undefined}
          className="font-mono uppercase"
        />
        <Button type="submit" variant="outline" className="shrink-0">
          <Search aria-hidden="true" strokeWidth={1.75} />
          Cek Status
        </Button>
      </div>
      {error && (
        <p id={f("booking-code-error")} className="text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
