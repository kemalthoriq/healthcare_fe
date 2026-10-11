"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_NOTE = 2000;

type TreatmentNoteFormProps = {
  initial: string;
  pending: boolean;
  onSave: (content: string) => Promise<unknown>;
};

export function TreatmentNoteForm({ initial, pending, onSave }: TreatmentNoteFormProps) {
  const [content, setContent] = useState(initial);
  const [error, setError] = useState("");
  const dirty = content.trim() !== initial.trim();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) {
      setError("Catatan wajib diisi.");
      return;
    }
    setError("");
    await onSave(content.trim()).catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <Label htmlFor="treatment-note" className="sr-only">
        Catatan treatment
      </Label>
      <Textarea
        id="treatment-note"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={MAX_NOTE}
        rows={5}
        placeholder="Hasil pemeriksaan, tindakan, produk yang dipakai, saran perawatan lanjutan"
        aria-invalid={!!error}
        aria-describedby={error ? "treatment-note-error" : "treatment-note-help"}
      />
      {error ? (
        <p id="treatment-note-error" className="text-sm text-danger">
          {error}
        </p>
      ) : (
        <p id="treatment-note-help" className="text-sm text-muted-foreground">
          Hanya terlihat oleh staf klinik. {content.length}/{MAX_NOTE}
        </p>
      )}
      <Button type="submit" size="sm" disabled={!dirty || pending}>
        {pending && <Loader2 aria-hidden="true" className="animate-spin" />}
        Simpan Catatan
      </Button>
    </form>
  );
}
