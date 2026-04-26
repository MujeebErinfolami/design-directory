"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  aspectClass?: string; // e.g. "aspect-video" or "aspect-[4/3]"
}

export function ImageUpload({
  value,
  onChange,
  label,
  required,
  aspectClass = "aspect-video",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {value ? (
        <div className={`relative overflow-hidden rounded-lg border border-border ${aspectClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Upload preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/60 disabled:opacity-50 ${aspectClass}`}
        >
          <Upload className="h-5 w-5" />
          <span>{uploading ? "Uploading…" : "Click to upload"}</span>
          <span className="text-xs">JPG, PNG, WebP · max 10 MB</span>
        </button>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
