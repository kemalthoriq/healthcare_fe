"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { CircleAlert, ImageIcon, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api/client";
import { ACCEPTED_TYPES, uploadImage, validateImageFile, type UploadFolder } from "@/lib/api/uploads";
import { isOptimizableImage } from "@/lib/images";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  folder: UploadFolder;
  shape: "landscape" | "wide" | "circle";
  hint: string;
  error?: string;
};

const shapeClass = {
  landscape: "aspect-[4/3] w-full max-w-60 rounded-md",
  wide: "aspect-video w-full max-w-72 rounded-md",
  circle: "aspect-square w-28 rounded-full",
};

export function ImageUpload({ label, value, onChange, folder, shape, hint, error }: ImageUploadProps) {
  const uid = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const uploading = progress !== null;
  const message = uploadError ?? error;

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    const invalid = validateImageFile(file);
    if (invalid) {
      setUploadError(invalid);
      return;
    }
    setUploadError(null);
    setProgress(0);
    try {
      const url = await uploadImage(folder, file, setProgress);
      onChange(url);
    } catch (err) {
      if (isApiError(err, "UPLOAD_NOT_CONFIGURED")) {
        setUploadError("Upload gambar belum diaktifkan di server. Untuk sementara, tempel URL gambar.");
        setShowUrl(true);
      } else {
        setUploadError(isApiError(err) ? err.message : "Upload gambar gagal. Silakan coba lagi.");
      }
    } finally {
      setProgress(null);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <p id={`${uid}-label`} className="text-sm font-medium text-neutral-700">
        {label} <span className="font-normal text-muted-foreground">(opsional)</span>
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={cn("relative shrink-0 overflow-hidden border border-border bg-neutral-100", shapeClass[shape])}>
          {isOptimizableImage(value) ? (
            <Image src={value} alt={`Pratinjau ${label.toLowerCase()}`} fill sizes="288px" className="object-cover" />
          ) : (
            <span className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center text-neutral-400">
              <ImageIcon aria-hidden="true" strokeWidth={1.75} className="size-7" />
              {value && <span className="text-xs">Tidak tampil di situs</span>}
            </span>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 aria-hidden="true" className="size-6 animate-spin text-sage-600" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              aria-describedby={`${uid}-hint`}
            >
              <Upload aria-hidden="true" strokeWidth={1.75} />
              {value ? "Ganti gambar" : "Pilih gambar"}
            </Button>
            {value && !uploading && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                <Trash2 aria-hidden="true" strokeWidth={1.75} />
                Hapus gambar
              </Button>
            )}
          </div>

          {uploading && (
            <div
              role="progressbar"
              aria-label="Progres upload"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="h-1.5 max-w-60 overflow-hidden rounded-full bg-neutral-200"
            >
              <div className="h-full bg-sage-600 transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          )}

          <p id={`${uid}-hint`} className="text-sm text-muted-foreground">
            {hint} JPG, PNG, atau WebP, maks 2 MB.
          </p>

          {message && (
            <p role="alert" className="flex items-start gap-1.5 text-sm text-danger">
              <CircleAlert aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
              {message}
            </p>
          )}

          {showUrl ? (
            <div className="space-y-1.5">
              <label htmlFor={`${uid}-url`} className="text-sm text-neutral-700">
                URL gambar
              </label>
              <Input
                id={`${uid}-url`}
                type="url"
                inputMode="url"
                placeholder="https://res.cloudinary.com/…"
                value={value}
                onChange={(event) => onChange(event.target.value.trim())}
                aria-invalid={!!error}
              />
            </div>
          ) : (
            <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setShowUrl(true)}>
              <Link2 aria-hidden="true" strokeWidth={1.75} />
              Tempel URL
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
